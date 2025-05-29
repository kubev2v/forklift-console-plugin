import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { type CreatePlanParams, ProviderType } from '../types';

/**
 * Creates a migration Plan resource
 * Links together providers, network maps, storage maps, and VMs to be migrated
 */
export const createPlan = async ({
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
