import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { produce } from 'immer';
import { deepCopy } from 'src/utils/deepCopy';

import {
  NetworkMapModel,
  PlanModel,
  PlanModelRef,
  StorageMapModel,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { k8sCreate, type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { getResourceUrl } from '../../utils/helpers/getResourceUrl';

import { setAPiError } from './reducer/actions';
import { getObjectRef, type ObjectRef } from './reducer/helpers';
import type { CreateVmMigrationPageState } from './types';

const createStorage = async (storageMap: V1beta1StorageMap) =>
  k8sCreate({
    data: storageMap,
    model: StorageMapModel,
  });

const createNetwork = async (netMap: V1beta1NetworkMap) => {
  return k8sCreate({
    data: updateNetworkMapDestination(netMap),
    model: NetworkMapModel,
  });
};

const createPlan = async (
  plan: V1beta1Plan,
  netMap: V1beta1NetworkMap,
  storageMap: V1beta1StorageMap,
) => {
  const createdPlan = await k8sCreate({
    data: plan,
    model: PlanModel,
  });
  const ownerReferences = [getObjectRef(createdPlan)];
  return [ownerReferences, netMap, storageMap];
};

const addOwnerRef = async (
  model: K8sModel,
  resource: V1beta1NetworkMap | V1beta1StorageMap,
  ownerReferences: ObjectRef[],
) => {
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

export const useSaveEffect = (state: CreateVmMigrationPageState, dispatch) => {
  const history = useHistory();
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  useEffect(() => {
    const {
      flow,
      underConstruction: { netMap, plan, storageMap },
    } = state;
    if (!flow.editingDone || !mounted.current) {
      return;
    }

    Promise.all([createStorage(storageMap), createNetwork(netMap)])
      .then(async ([resolvedStorageMap, resolvedNetMap]) =>
        createPlan(
          produce(plan, (draft) => {
            draft.spec.map.network = getObjectRef(resolvedNetMap);
            draft.spec.map.storage = getObjectRef(resolvedStorageMap);
          }),
          netMap,
          storageMap,
        ),
      )
      .then(async ([ownerReferences, resolvedNetMap, resolvedStorageMap]) =>
        Promise.all([
          addOwnerRef(
            StorageMapModel,
            resolvedStorageMap as V1beta1StorageMap,
            ownerReferences as ObjectRef[],
          ),
          addOwnerRef(
            NetworkMapModel,
            resolvedNetMap as V1beta1NetworkMap,
            ownerReferences as ObjectRef[],
          ),
        ]),
      )
      .then(
        () =>
          mounted.current &&
          history.push(
            getResourceUrl({
              name: plan.metadata.name,
              namespace: plan.metadata.namespace,
              reference: PlanModelRef,
            }),
          ),
      )
      .catch((error) => mounted.current && dispatch(setAPiError(error)));
  }, [state.flow.editingDone, state.underConstruction.storageMap]);
};

/**
 * Updates the destination name and namespace in the network map entries.
 * If the destination name contains a '/', it splits the name into two parts.
 * The first part becomes the new namespace, and the second part becomes the new name.
 *
 * @param {NetworkMap} networkMap - The network map object to update.
 * @returns {NetworkMap} The updated network map object.
 */
export const updateNetworkMapDestination = (networkMap: V1beta1NetworkMap): V1beta1NetworkMap => {
  const networkMapCopy = deepCopy(networkMap);

  networkMapCopy.spec.map?.forEach((entry) => {
    const [namespace, name] = entry?.destination?.name?.split('/') ?? [];
    if (namespace && name) {
      entry.destination.namespace = namespace;
      entry.destination.name = name;
    }
  });
  return networkMapCopy;
};
