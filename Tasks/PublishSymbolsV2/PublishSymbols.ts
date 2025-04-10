import * as fs from "fs";
import * as path from "path";
import * as telemetry from "azure-pipelines-tasks-utility-common/telemetry";
import * as clientToolUtils from "azure-pipelines-tasks-packaging-common/universal/ClientToolUtilities";
import * as clientToolRunner from "azure-pipelines-tasks-packaging-common/universal/ClientToolRunner";
import * as tl from "azure-pipelines-task-lib/task";
import { IExecSyncResult, IExecOptions } from "azure-pipelines-task-lib/toolrunner";
import { getAccessTokenViaWorkloadIdentityFederation } from './Auth';

const nodeVersion = parseInt(process.version.split('.')[0].replace('v', ''));
if(nodeVersion < 16) {
    console.log(tl.loc('NodeVersionSupport', nodeVersion));
    tl.error(tl.loc('NodeVersionSupport', nodeVersion));

}

const symbolRequestAlreadyExistsError = 17;
const {"v4": uuidV4} = require('uuid');

interface IClientToolOptions {
    clientToolFilePath: string;
    detailedLog: boolean;
    expirationInDays: string;
    indexableFileFormats: string;
    personalAccessToken: string;
    requestName: string;
    sourcePathListFileName: string;
    symbolServiceUri: string;
    manifest: string;
}

export async function run(clientToolFilePath: string): Promise<void> {

    try {
        // Get the inputs.
        tl.debug("Getting client tool inputs");

        let AsAccountName = tl.getVariable("ArtifactServices.Symbol.AccountName");
        let symbolServiceUri = "https://" + encodeURIComponent(AsAccountName) + ".artifacts.visualstudio.com"
        let personalAccessToken = tl.getVariable("ArtifactServices.Symbol.PAT");
        const connectedServiceName = tl.getInput("ConnectedServiceName", false);
        const manifest = tl.getInput("Manifest", false); 
        if(manifest && !fileExists(manifest)) {
            throw new Error(tl.loc("ManifestFileNotFound", manifest));
        }
        else if(manifest && fileExists(manifest)) {
            tl.debug("Manifest file found at: " + manifest);
        }
        else
        {
            tl.debug("Manifest is not specified");
        }

        tl.debug("connectedServiceName: " + connectedServiceName);

        if(connectedServiceName){
            tl.debug("connectedServiceName: " + connectedServiceName);
            personalAccessToken = await getAccessTokenViaWorkloadIdentityFederation(connectedServiceName);
        }
        else if (AsAccountName) {
            tl.debug("AsAccountName: " + AsAccountName);
            personalAccessToken = tl.getVariable("ArtifactServices.Symbol.PAT");
        }
        else {
            personalAccessToken = clientToolUtils.getSystemAccessToken();
            //Get the symbol service uri and set it to the symbolServiceUri
            const serviceUri = tl.getEndpointUrl("SYSTEMVSSCONNECTION", false);
            symbolServiceUri = await getSymbolServiceUri(serviceUri, personalAccessToken);
        }

        let defaultSymbolFolder: string = tl.getVariable("Build.SourcesDirectory") ? tl.getVariable("Build.SourcesDirectory") : "";
        let symbolsFolder: string = tl.getInput("SymbolsFolder", false) ? tl.getInput("SymbolsFolder", false) : defaultSymbolFolder;
        let uniqueId: string = tl.getVariable("Build.UniqueId") ? tl.getVariable("Build.UniqueId") : uuidV4();
        let searchPatterns = tl.getDelimitedInput("SearchPattern", "\n", false) ? tl.getDelimitedInput("SearchPattern", "\n", false) : ["**\\bin\\**\\*.pdb"];
        let indexableFileFormats = tl.getInput("IndexableFileFormats", false);

        // If SymbolsArtifactName input is not the default value, use that as the request name instead of the default
        let symbolsArtifactName: string = tl.getInput("SymbolsArtifactName", false);
        let requestName: string;
        let defaultArtifactName: string = tl.getVariable("BuildConfiguration") ? "Symbols_" + tl.getVariable("BuildConfiguration") : "Symbols_$(BuildConfiguration)"
        if (symbolsArtifactName && symbolsArtifactName !== defaultArtifactName) {
            requestName = symbolsArtifactName;
        }
        else {
            requestName = (tl.getVariable("System.TeamProject") + "/" +
                tl.getVariable("Build.DefinitionName") + "/" +
                tl.getVariable("Build.BuildNumber") + "/" +
                tl.getVariable("Build.BuildId")  + "/" +
                uniqueId).toLowerCase();
        }

        let expirationInDays: string = tl.getInput("SymbolExpirationInDays", false) ? tl.getInput("SymbolExpirationInDays", false) : '36530';
        let detailedLog: boolean = tl.getBoolInput("DetailedLog");

        // Determine specific files to publish, if provided
        let matches = tl.findMatch(symbolsFolder, searchPatterns);
        let fileList = matches.length > 0 ? matches.filter(function (testPath) {
            return fs.statSync(testPath).isFile();
        }) : [];
        console.log(tl.loc("FoundNFiles", fileList.length));

        if (fileList.length <= 0) {
            tl.setResult(tl.TaskResult.Succeeded, tl.loc("NoFilesForPublishing"));
        }
        else {
            let execResult: IExecSyncResult;
            if (fs.existsSync(clientToolFilePath)) {
                tl.debug("Publishing the symbols");
                tl.debug(`Using endpoint ${symbolServiceUri} to create request ${requestName} with content in ${symbolsFolder}`);

                tl.debug(`Removing trailing '\/' in ${symbolServiceUri}`);
                symbolServiceUri = clientToolUtils.trimEnd(symbolServiceUri, '/');

                // Create temp file listing all files found
                let tmpDir = tl.getVariable("Agent.TempDirectory");
                let sourcePathListFileName = path.join(tmpDir, `ListOfSymbols-${uniqueId}.txt`);
                fs.writeFileSync(sourcePathListFileName, fileList.join("\n"));

                const publishOptions = {
                    clientToolFilePath,
                    detailedLog,
                    expirationInDays,
                    indexableFileFormats,
                    personalAccessToken,
                    requestName,
                    sourcePathListFileName,
                    symbolServiceUri,
                    manifest
                } as IClientToolOptions;

                let toolRunnerOptions = clientToolRunner.getClientToolOptions();
                execResult = publishSymbolsUsingClientTool(symbolsFolder, publishOptions, toolRunnerOptions);
                if (fs.existsSync(sourcePathListFileName)) {
                    fs.unlinkSync(sourcePathListFileName);
                }

                if (execResult != null && execResult.code === symbolRequestAlreadyExistsError) {
                    telemetry.logResult("Symbols", "PublishingCommand", execResult.code);
                    throw new Error(tl.loc("Error_UnexpectedErrorSymbolsPublishing",
                        execResult.code,
                        execResult.stderr ? execResult.stderr.trim() : execResult.stderr));
                }

                tl.setResult(tl.TaskResult.Succeeded, tl.loc("SymbolsPublishedSuccessfully") + execResult.stdout.trim());
            }
            else {
                throw new Error(tl.loc("Error_SymbolPublishingToolNotFound", clientToolFilePath));
            }
        }
    }
    catch (error) {
        tl.error(error);
        tl.setResult(tl.TaskResult.Failed, tl.loc("FailedToPublishSymbols", error.message));

    } finally {
        process.env.SYMBOL_PAT_AUTH_TOKEN = '';
    }
}

function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

function publishSymbolsUsingClientTool(
    sourcePath: string,
    options: IClientToolOptions,
    execOptions: IExecOptions) {
    const command = new Array<string>();
    command.push(
        "publish",
        "--service", options.symbolServiceUri,
        "--name", options.requestName,
        "--directory", sourcePath
    );

    if (options.manifest) {
        command.push("--manifest", options.manifest);
        tl.debug("Manifest: " + options.manifest);
    }

    if (options.expirationInDays) {
        command.push("--expirationInDays", options.expirationInDays);
    }

    if (options.personalAccessToken) {
        process.env.SYMBOL_PAT_AUTH_TOKEN = options.personalAccessToken
        command.push("--patAuthEnvVar", 'SYMBOL_PAT_AUTH_TOKEN');
    }

    if (options.sourcePathListFileName) {
        command.push("--fileListFileName", options.sourcePathListFileName);
    }

    if (options.indexableFileFormats) {
        command.push("--indexableFileFormats", options.indexableFileFormats);
    }

    if (options.detailedLog) {
        command.push("--tracelevel", "verbose");
    }
    else {
        command.push("--tracelevel", "info");
    }

    command.push("--globalretrycount", "2");

    console.log(tl.loc("Info_ClientTool", options.clientToolFilePath));
    const execResult: IExecSyncResult = clientToolRunner.runClientTool(
        options.clientToolFilePath,
        command,
        execOptions
    );

    if (execResult.code === 0 || execResult.code == symbolRequestAlreadyExistsError) {
        return execResult;
    }

    telemetry.logResult("Symbols", "PublishingCommand", execResult.code);
    throw new Error(tl.loc("Error_UnexpectedErrorSymbolsPublishing",
        execResult.code,
        execResult.stderr ? execResult.stderr.trim() : execResult.stderr));
}

async function getSymbolServiceUri(collectionUri: string, accessToken: string): Promise<string> {
    let locationServiceUri = await clientToolUtils.getServiceUriFromAreaId(collectionUri, accessToken, "951917ac-a960-4999-8464-e3f0aa25b381");
    let artifactsUri: string;
    if (locationServiceUri) {
        artifactsUri = await clientToolUtils.getServiceUriFromAreaId(locationServiceUri, accessToken, "00000016-0000-8888-8000-000000000000");
    }
    else {
        let baseRegEx = new RegExp("\\.(visualstudio\\.com|vsts\\.me)");
        if (collectionUri.match(baseRegEx)) {
            artifactsUri = collectionUri.replace(baseRegEx, ".artifacts.$1");
        }
        else {
            let regEx = new RegExp("://[^/]+/([^/]+)");
            artifactsUri = collectionUri.replace(regEx, "://$1.artifacts.visualstudio.com");
        }
    }

    return artifactsUri;
}