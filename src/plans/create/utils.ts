import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { getObjectRef, type ObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';

import {
  NetworkMapModel,
  PlanModel,
  PlanModelRef,
  StorageMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
  type V1beta1Plan,
  type V1beta1Provider,
  type V1beta1StorageMap,
  type V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { k8sCreate, type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { defaultNetMapping, NetworkMapFieldId } from './steps/network-map/constants';
import {
  type CreateNetworkMapParams,
  type CreatePlanFormData,
  type CreatePlanParams,
  type CreateStorageMapParams,
  ProviderType,
} from './types';

/**
 * Determines if the source provider supports warm migration
 * Currently only vSphere and oVirt providers support warm migration
 */
export const hasWarmMigrationProviderType = (
  sourceProvider: V1beta1Provider | undefined,
): boolean => {
  const sourceProviderType = sourceProvider?.spec?.type;
  return sourceProviderType === ProviderType.Vsphere || sourceProviderType === ProviderType.Ovirt;
};

/**
 * Creates a NetworkMap resource for VM migration
 * Maps source networks to destination networks or pods based on configuration
 */
const createNetworkMap = async ({
  networkMappings,
  planProject,
  sourceProvider,
  targetProvider,
}: CreateNetworkMapParams) => {
  const sourceProviderName = sourceProvider?.metadata?.name;
  const networkMap: V1beta1NetworkMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      ...(sourceProviderName && { generateName: `${sourceProvider?.metadata?.name}-` }),
      namespace: planProject,
    },
    spec: {
      map: networkMappings?.reduce(
        (acc: V1beta1NetworkMapSpecMap[], { sourceNetwork, targetNetwork }) => {
          if (sourceNetwork.name && targetNetwork.name) {
            acc.push({
              // Handle pod network type or multus network type for the destination
              destination:
                targetNetwork.name === defaultNetMapping[NetworkMapFieldId.TargetNetwork].name
                  ? { type: 'pod' }
                  : { name: targetNetwork.name, namespace: planProject, type: 'multus' },
              // Handle pod network type or regular network for the source
              source:
                sourceNetwork.id === 'pod'
                  ? { type: 'pod' }
                  : {
                      id: sourceNetwork.id,
                      name: sourceNetwork.name,
                      // Set type to 'multus' only for OpenShift source providers
                      type:
                        sourceProvider?.spec?.type === ProviderType.Openshift
                          ? 'multus'
                          : undefined,
                    },
            });
          }

          return acc;
        },
        [],
      ),
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
    },
  };

  return k8sCreate({
    data: networkMap,
    model: NetworkMapModel,
  });
};

/**
 * Creates a StorageMap resource for VM migration
 * Maps source storage to destination storage classes based on provider type
 */
const createStorageMap = async ({
  planProject,
  sourceProvider,
  storageMappings,
  targetProvider,
}: CreateStorageMapParams) => {
  const sourceProviderName = sourceProvider?.metadata?.name;

  const storageMap: V1beta1StorageMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      ...(sourceProviderName && { generateName: `${sourceProvider?.metadata?.name}-` }),
      namespace: planProject,
    },
    spec: {
      map: storageMappings?.reduce(
        (acc: V1beta1StorageMapSpecMap[], { sourceStorage, targetStorage }) => {
          if (sourceStorage.name && targetStorage.name) {
            if (sourceProvider?.spec?.type === 'openshift') {
              // Special handling for OpenShift source providers
              acc.push({
                destination: { storageClass: targetStorage.name },
                source: {
                  id: sourceStorage.id,
                  name: targetStorage.name.replace(/^\//gu, ''),
                },
              });
            }

            // Special handling for Glance storage
            if (sourceStorage.name === 'glance') {
              acc.push({
                destination: { storageClass: targetStorage.name },
                source: {
                  name: 'glance',
                },
              });
            }

            // Default storage mapping
            acc.push({
              destination: { storageClass: targetStorage.name },
              source: {
                id: sourceStorage.id,
              },
            });
          }

          return acc;
        },
        [],
      ),
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
    },
  };

  return k8sCreate({
    data: storageMap,
    model: StorageMapModel,
  });
};

/**
 * Creates a migration Plan resource
 * Links together providers, network maps, storage maps, and VMs to be migrated
 */
const createPlan = async ({
  networkMap,
  planName,
  planProject,
  sourceProvider,
  storageMap,
  targetProvider,
  vms,
}: CreatePlanParams) => {
  const plan: V1beta1Plan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: planName,
      namespace: planProject,
    },
    spec: {
      map: {
        network: getObjectRef(networkMap),
        storage: getObjectRef(storageMap),
      },
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
      targetNamespace: planProject,
      // Include namespace only for OpenShift VMs
      vms: vms.map((vm) => ({
        id: vm.id,
        name: vm.name,
        namespace: vm.providerType === ProviderType.Openshift ? vm.namespace : undefined,
      })),
    },
  };

  const createdPlan = await k8sCreate({
    data: plan,
    model: PlanModel,
  });

  return getObjectRef(createdPlan);
};

/**
 * Adds owner references to a resource
 * This establishes parent-child relationships between Kubernetes resources
 */
const addOwnerRef = async (
  model: K8sModel,
  resource: V1beta1NetworkMap | V1beta1StorageMap,
  ownerReferences: ObjectRef[],
) => {
  // Remove namespace field from owner references as it's not needed
  const cleanOwnerReferences = ownerReferences.map((ref) => ({
    ...ref,
    namespace: undefined,
  }));

  return k8sPatch({
    data: [
      {
        op: 'add',
        path: '/metadata/ownerReferences',
        value: cleanOwnerReferences,
      },
    ],
    model,
    resource,
  });
};

/**
 * Handles the plan submission process including creation of network map, storage map,
 * plan, and establishing owner references.
 */
export const handlePlanSubmission = async (formData: CreatePlanFormData): Promise<void> => {
  const { networkMap, planName, planProject, sourceProvider, storageMap, targetProvider, vms } =
    formData;

  // Create network map
  const createdNetworkMap = await createNetworkMap({
    networkMappings: networkMap,
    planProject,
    sourceProvider,
    targetProvider,
  });

  // Create storage map
  const createdStorageMap = await createStorageMap({
    planProject,
    sourceProvider,
    storageMappings: storageMap,
    targetProvider,
  });

  // Create plan with references to created maps
  const createdPlanRef = await createPlan({
    networkMap: createdNetworkMap,
    planName,
    planProject,
    sourceProvider,
    storageMap: createdStorageMap,
    targetProvider,
    vms: Object.values(vms),
  });

  // Add owner references to link resources
  await addOwnerRef(StorageMapModel, createdStorageMap, [createdPlanRef]);
  await addOwnerRef(NetworkMapModel, createdNetworkMap, [createdPlanRef]);
};

export const getCreatedPlanPath = (planName: string, planProject: string) =>
  getResourceUrl({
    name: planName,
    namespace: planProject,
    reference: PlanModelRef,
  });
