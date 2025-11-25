import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { getObjectRef } from '@utils/helpers/getObjectRef';

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
  planDescription,
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
  const plan: V1beta1Plan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: planName,
      namespace: planProject,
    },
    spec: {
      ...(planDescription ? { description: planDescription } : {}),
      map: {
        network: getObjectRef(networkMap),
        storage: getObjectRef(storageMap),
      },
      migrateSharedDisks,
      preserveStaticIPs: preserveStaticIps,
      provider: {
        destination: getObjectRef(targetProvider),
        source: getObjectRef(sourceProvider),
      },
      targetNamespace: targetProject,
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
