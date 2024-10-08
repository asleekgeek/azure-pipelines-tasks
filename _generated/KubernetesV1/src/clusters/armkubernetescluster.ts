"use strict";

import tl = require('azure-pipelines-task-lib/task');
import { AzureAksService } from 'azure-pipelines-tasks-azure-arm-rest/azure-arm-aks-service';
import { AzureRMEndpoint } from 'azure-pipelines-tasks-azure-arm-rest/azure-arm-endpoint';
import { AzureEndpoint, AKSCluster, AKSClusterAccessProfile, AKSCredentialResult} from 'azure-pipelines-tasks-azure-arm-rest/azureModels';

// get kubeconfig file content
async function getKubeConfigFromAKS(azureSubscriptionEndpoint: string, resourceGroup: string, clusterName: string, useClusterAdmin?: boolean) : Promise<string> {
    var azureEndpoint: AzureEndpoint = await (new AzureRMEndpoint(azureSubscriptionEndpoint)).getEndpoint();
    var aks = new AzureAksService(azureEndpoint);
    
    tl.debug(tl.loc("KubernetesClusterResourceGroup", clusterName, resourceGroup));

    var clusterInfo : AKSCredentialResult = await aks.getClusterCredential(resourceGroup, clusterName, useClusterAdmin);
    var base64Kubeconfig = Buffer.from(clusterInfo.value, 'base64');
    return base64Kubeconfig.toString();
}

export async function getKubeConfig(): Promise<string> {
    var azureSubscriptionEndpoint : string = tl.getInput("azureSubscriptionEndpoint", true);
    var resourceGroup : string = tl.getInput("azureResourceGroup", true);
    var clusterName : string = tl.getInput("kubernetesCluster", true);
    var useClusterAdmin: boolean = tl.getBoolInput('useClusterAdmin');
    return getKubeConfigFromAKS(azureSubscriptionEndpoint, resourceGroup, clusterName, useClusterAdmin);
}
