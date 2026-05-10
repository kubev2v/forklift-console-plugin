import { useCallback } from 'react';

import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';

import { processDeepInspections } from '../utils/createDeepInspections';
import type { CreateInspectionsFn, InspectionCreateResult, VmInspectionRef } from '../utils/types';

type UseCreateDeepInspectionsParams = {
  plan?: V1beta1Plan;
  provider: V1beta1Provider;
};

export const useCreateDeepInspections = ({
  plan,
  provider,
}: UseCreateDeepInspectionsParams): CreateInspectionsFn => {
  return useCallback(
    async (vms: VmInspectionRef[]): Promise<InspectionCreateResult> =>
      processDeepInspections(vms, provider, plan),
    [plan, provider],
  );
};
