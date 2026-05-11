import { useCallback } from 'react';

import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';

import { processDeepInspections } from '../utils/createDeepInspections';
import type { CreateInspectionsFn, InspectionCreateResult, VmInspectionRef } from '../utils/types';

type UseCreateDeepInspections = (params: {
  plan?: V1beta1Plan;
  provider: V1beta1Provider;
}) => CreateInspectionsFn;

export const useCreateDeepInspections: UseCreateDeepInspections = ({ plan, provider }) => {
  return useCallback(
    async (vms: VmInspectionRef[]): Promise<InspectionCreateResult> =>
      processDeepInspections(vms, provider, plan),
    [plan, provider],
  );
};
