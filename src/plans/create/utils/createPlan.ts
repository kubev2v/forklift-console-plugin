import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';
import type { EnhancedPlan } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { PlanModel } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationTypeValue } from '../steps/migration-type/constants';
import { type CreatePlanParams, ProviderType } from '../types';

/**
 * Creates a migration Plan resource
 * Links together providers, network maps, storage maps, and VMs to be migrated
 */
export const createPlan = async ({
  luks,
  migrationType,
  networkMap,
  planName,
  planProject,
  preserveStaticIps,
  rootDevice,
  sharedDisks,
  sourceProvider,
  storageMap,
  targetProvider,
  transferNetwork,
  vms,
}: CreatePlanParams) => {
  const plan: EnhancedPlan = {
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
      ...(sharedDisks && { migrateSharedDisks: sharedDisks }),
      ...(preserveStaticIps && { preserveStaticIPs: preserveStaticIps }),
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
      targetNamespace: planProject,
      ...(transferNetwork && { transferNetwork }),
      // Include namespace only for OpenShift VMs
      vms: vms.map((vm) => ({
        id: vm.id,
        name: vm.name,
        namespace: vm.providerType === ProviderType.Openshift ? vm.namespace : undefined,
        ...(rootDevice && { rootDisk: rootDevice }),
        ...(luks?.name && { luks }),
      })),
      warm: migrationType === MigrationTypeValue.Warm,
    },
  };

  const createdPlan = await k8sCreate({
    data: plan,
    model: PlanModel,
  });

  return getObjectRef(createdPlan);
};
