import { getObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';
import type { EnhancedPlan } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { PlanModel } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationTypeValue } from '../steps/migration-type/constants';
import type { CreatePlanParams } from '../types';

import { buildPlanSpecVms } from './buildPlanSpecVms';

/**
 * Constructs and creates a Plan custom resource from input params.
 * Connects providers, maps, transfer networks, hooks, and selected VMs.
 */
export const createPlan = async ({
  luks,
  migrateSharedDisks,
  migrationType,
  nbdeClevis,
  networkMap,
  planName,
  planProject,
  postHook,
  preHook,
  preserveStaticIps,
  rootDevice,
  sourceProvider,
  storageMap,
  targetPowerState,
  targetProject,
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
      migrateSharedDisks,
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
      targetNamespace: targetProject,
      ...(preserveStaticIps && { preserveStaticIPs: preserveStaticIps }),
      ...(transferNetwork && { transferNetwork }),
      targetPowerState,
      type: migrationType,
      vms: buildPlanSpecVms({ luks, nbdeClevis, postHook, preHook, rootDevice, vms }),
      warm: migrationType === MigrationTypeValue.Warm,
    },
  };

  const createdPlan = await k8sCreate({
    data: plan,
    model: PlanModel,
  });

  return getObjectRef(createdPlan);
};
