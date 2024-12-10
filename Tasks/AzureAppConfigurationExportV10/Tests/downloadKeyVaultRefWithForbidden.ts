import { TaskMockRunner } from "azure-pipelines-task-lib/mock-run";
import * as path from "path";

let taskPath = path.join(__dirname, "..", "index.js");
let taskRunner:TaskMockRunner = new TaskMockRunner(taskPath);

taskRunner.setInput("AppConfigurationEndpoint", "https://Test.azconfig.io");
taskRunner.setInput("selectionMode", "Default");
taskRunner.setInput("keyFilter", "*");
taskRunner.setInput("ConnectedServiceName","AzureRMSpn");

taskRunner.registerMock('azure-pipelines-task-lib/toolrunner', require('azure-pipelines-task-lib/mock-toolrunner'));
taskRunner.registerMock('@azure/app-configuration', require('./mock_node_modules/app-configuration/appConfigurationClient'));
taskRunner.registerMock('@azure/keyvault-secrets', require("./mock_node_modules/keyvault-secrets/forbiddenSecretClient"));

taskRunner.run();