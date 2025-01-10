import { useEffect, useRef } from 'react';
import { PlanMappingsSectionState } from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappingsSection';
import { patchPlanMappingsData } from 'src/modules/Plans/views/details/utils/patchPlanMappingsData';

import {
  PlanModel,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1Plan,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { setAPiError } from './reducer/actions';
import { CreateVmMigrationPageState } from './types';

const updatePlan = async (plan: V1beta1Plan) => {
  await k8sPatch({
    model: PlanModel,
    resource: plan,
    data: [
      {
        op: 'replace',
        path: '/spec/vms',
        value: plan.spec.vms,
      },
    ],
  });
};

export const useUpdateEffect = (
  state: CreateVmMigrationPageState,
  dispatch,
  planMappingsState: PlanMappingsSectionState,
  onClose,
) => {
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
      updatePlan(plan),
      updateMappings(
        planMappingsState.planNetworkMaps,
        planMappingsState.planStorageMaps,
        planMappingsState.updatedNetwork,
        planMappingsState.updatedStorage,
      ),
    ])
      .then(() => onClose())
      .catch((error) => mounted.current && dispatch(setAPiError(error)));
  }, [state.flow.editingDone]);
};

async function updateMappings(
  planNetworkMaps: V1beta1NetworkMap,
  planStorageMaps: V1beta1StorageMap,
  updatedNetwork: V1beta1NetworkMapSpecMap[],
  updatedStorage: V1beta1StorageMapSpecMap[],
) {
  await patchPlanMappingsData(planNetworkMaps, planStorageMaps, updatedNetwork, updatedStorage);
}
