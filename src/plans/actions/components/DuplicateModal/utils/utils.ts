import { ADD } from '@components/ModalForm/utils/constants';
import {
  NetworkMapModel,
  PlanModel,
  StorageMapModel,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1PlanSpecMap,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
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
    },
  };
  const initPlan = await k8sCreate({ data: newPlanData, model: PlanModel });

  const newPlanOwnerReference = buildOwnerReference(initPlan, {
    blockOwnerDeletion: false,
  });

  const newNetworkMapData: V1beta1NetworkMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name: `${newPlanName}-${getRandomChars(5)}`,
      namespace,
      ownerReferences: [newPlanOwnerReference],
    },
    spec: networkMap.spec,
  };

  const newStorageMapData: V1beta1StorageMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      name: `${newPlanName}-${getRandomChars(5)}`,
      namespace,
      ownerReferences: [newPlanOwnerReference],
    },
    spec: storageMap.spec,
  };

  await k8sCreate({ data: newNetworkMapData, model: NetworkMapModel });

  await k8sCreate({ data: newStorageMapData, model: StorageMapModel });

  const mappings: V1beta1PlanSpecMap = {
    network: {
      name: getName(newNetworkMapData),
      namespace: getNamespace(newNetworkMapData),
    },
    storage: {
      name: getName(newStorageMapData),
      namespace: getNamespace(newStorageMapData),
    },
  };

  const newPlan = await k8sPatch({
    data: [
      {
        op: ADD,
        path: '/spec/map',
        value: mappings,
      },
    ],
    model: PlanModel,
    resource: initPlan,
  });

  return newPlan;
};
