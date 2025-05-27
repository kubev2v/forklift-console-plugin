import { produce } from 'immer';

import {
  NetworkMapModel,
  PlanModel,
  StorageMapModel,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { buildOwnerReference, getRandomChars } from '@utils/crds/common/utils';

type CreateDuplicatePlanParams = {
  plan: V1beta1Plan;
  networkMap: V1beta1NetworkMap;
  storageMap: V1beta1StorageMap;
  newPlanName: string;
};
export const createDuplicatePlanAndMapResources = async ({
  networkMap,
  newPlanName,
  plan,
  storageMap,
}: CreateDuplicatePlanParams) => {
  const namespace = getNamespace(plan);
  const newNetworkMapData: V1beta1NetworkMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name: `${newPlanName}-${getRandomChars(5)}`,
      namespace,
    },
    spec: networkMap.spec,
  };

  const newStorageMapData: V1beta1StorageMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      name: `${newPlanName}-${getRandomChars(5)}`,
      namespace,
    },
    spec: storageMap.spec,
  };

  const newPlanData: V1beta1Plan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: newPlanName,
      namespace,
    },
    spec: {
      ...plan.spec!,
      archived: false,
      map: {
        network: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'NetworkMap',
          name: getName(newNetworkMapData),
          namespace: getNamespace(newNetworkMapData),
        },
        storage: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'StorageMap',
          name: getName(newStorageMapData),
          namespace: getNamespace(newStorageMapData),
        },
      },
    },
  };
  const newPlan = await k8sCreate({ data: newPlanData, model: PlanModel });

  const newPlanOwnerReference = buildOwnerReference(newPlan, {
    blockOwnerDeletion: false,
  });

  const networkMapWithOwner = produce(newNetworkMapData, (draft) => {
    if (draft.metadata) {
      draft.metadata.ownerReferences = [newPlanOwnerReference];
    }
  });

  const storageMapWithOwner = produce(newStorageMapData, (draft) => {
    if (draft.metadata) {
      draft.metadata.ownerReferences = [newPlanOwnerReference];
    }
  });

  await k8sCreate({ data: networkMapWithOwner, model: NetworkMapModel });

  await k8sCreate({ data: storageMapWithOwner, model: StorageMapModel });

  return newPlan;
};
