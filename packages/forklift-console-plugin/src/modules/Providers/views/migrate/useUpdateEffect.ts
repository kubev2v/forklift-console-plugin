import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { produce } from 'immer';
import { PlanMappingsSectionState } from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappingsSection';
import { patchPlanMappingsData } from 'src/modules/Plans/views/details/utils/patchPlanMappingsData';
import { deepCopy } from 'src/utils';

import {
  NetworkMapModel,
  PlanModel,
  PlanModelRef,
  StorageMapModel,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1Plan,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { K8sModel, k8sPatch, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import { getResourceUrl } from '../../utils';

import { setAPiError } from './reducer/actions';
import { getObjectRef } from './reducer/helpers';
import { CreateVmMigrationPageState } from './types';

const updatePlan = async (
  plan: V1beta1Plan,
  netMap: V1beta1NetworkMap,
  storageMap: V1beta1StorageMap,
) => {
  const updatedPlan = await k8sUpdate({
    model: PlanModel,
    data: plan,
  });
  const ownerReferences = [getObjectRef(updatedPlan)];
  return [ownerReferences, netMap, storageMap];
};

const addOwnerRef = async (model: K8sModel, resource, ownerReferences) => {
  const cleanOwnerReferences = ownerReferences.map((ref) => ({
    ...ref,
    namespace: undefined,
  }));

  return await k8sPatch({
    model,
    resource,
    data: [
      {
        op: 'add',
        path: '/metadata/ownerReferences',
        value: cleanOwnerReferences,
      },
    ],
  });
};

export const useUpdateEffect = (
  state: CreateVmMigrationPageState,
  dispatch,
  planMappingsState: PlanMappingsSectionState,
) => {
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
      underConstruction: { plan },
    } = state;
    if (!flow.editingDone || !mounted.current) {
      return;
    }

    Promise.all([
      updateMappings(
        planMappingsState.planNetworkMaps,
        planMappingsState.planStorageMaps,
        planMappingsState.updatedNetwork,
        planMappingsState.updatedStorage,
      ),
    ])
      .then(([{ updatedNetworkMap, updatedStorageMap }]) => {
        return updatePlan(
          produce(plan, (draft) => {
            draft.spec.map.network = getObjectRef(updatedNetworkMap);
            draft.spec.map.storage = getObjectRef(updatedStorageMap);
          }),
          updatedNetworkMap,
          updatedStorageMap,
        );
      })
      .then(([ownerReferences, networkMap, storageMap]) =>
        Promise.all([
          addOwnerRef(StorageMapModel, storageMap, ownerReferences),
          addOwnerRef(NetworkMapModel, networkMap, ownerReferences),
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
  }, [state.flow.editingDone]);
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

async function updateMappings(
  planNetworkMaps: V1beta1NetworkMap,
  planStorageMaps: V1beta1StorageMap,
  updatedNetwork: V1beta1NetworkMapSpecMap[],
  updatedStorage: V1beta1StorageMapSpecMap[],
) {
  const { updatedNetworkMap, updatedStorageMap } = await patchPlanMappingsData(
    planNetworkMaps,
    planStorageMaps,
    updatedNetwork,
    updatedStorage,
  );
  return { updatedNetworkMap, updatedStorageMap };
}
