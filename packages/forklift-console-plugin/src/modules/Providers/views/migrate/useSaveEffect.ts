import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { produce } from 'immer';
import { deepCopy } from 'src/utils';

import {
  NetworkMapModel,
  PlanModel,
  PlanModelRef,
  StorageMapModel,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { k8sCreate, K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { getResourceUrl } from '../../utils';

import { setAPiError } from './reducer/actions';
import { getObjectRef } from './reducer/helpers';
import { CreateVmMigrationPageState } from './types';

const createStorage = (storageMap: V1beta1StorageMap) =>
  k8sCreate({
    model: StorageMapModel,
    data: storageMap,
  });

const createNetwork = (netMap: V1beta1NetworkMap) => {
  return k8sCreate({
    model: NetworkMapModel,
    data: updateNetworkMapDestination(netMap),
  });
};

const createPlan = async (
  plan: V1beta1Plan,
  netMap: V1beta1NetworkMap,
  storageMap: V1beta1StorageMap,
) => {
  const createdPlan = await k8sCreate({
    model: PlanModel,
    data: plan,
  });
  const ownerReferences = [getObjectRef(createdPlan)];
  return [ownerReferences, netMap, storageMap];
};

const addOwnerRef = async (model: K8sModel, resource, ownerReferences) => {
  return await k8sPatch({
    model,
    resource,
    data: [
      {
        op: 'add',
        path: '/metadata/ownerReferences',
        value: ownerReferences,
      },
    ],
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
      underConstruction: { plan, netMap, storageMap },
    } = state;
    if (!flow.editingDone || !mounted.current) {
      return;
    }

    Promise.all([createStorage(storageMap), createNetwork(netMap)])
      .then(([storageMap, netMap]) =>
        createPlan(
          produce(plan, (draft) => {
            draft.spec.map.network = getObjectRef(netMap);
            draft.spec.map.storage = getObjectRef(storageMap);
          }),
          netMap,
          storageMap,
        ),
      )
      .then(([ownerReferences, netMap, storageMap]) =>
        Promise.all([
          addOwnerRef(StorageMapModel, storageMap, ownerReferences),
          addOwnerRef(NetworkMapModel, netMap, ownerReferences),
        ]),
      )
      .then(
        () =>
          mounted.current &&
          history.push(
            getResourceUrl({
              reference: PlanModelRef,
              namespace: plan.metadata.namespace,
              name: plan.metadata.name,
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
export function updateNetworkMapDestination(networkMap: V1beta1NetworkMap): V1beta1NetworkMap {
  const networkMapCopy = deepCopy(networkMap);

  networkMapCopy.spec.map?.forEach((entry) => {
    const parts = entry?.destination?.name?.split('/');
    if (parts?.length === 2) {
      entry.destination.namespace = parts[0];
      entry.destination.name = parts[1];
    }
  });
  return networkMapCopy;
}
