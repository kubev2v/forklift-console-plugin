import { useMemo } from 'react';

import { PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { toTypedWatchResult } from '@utils/hooks/toTypedWatchResult';

import { getPlanStatusCounts } from '../utils/getPlanStatusCounts';

type PlanStatusCounts = Record<string, number>;

type PlanStatusCountsHookResponse = {
  count: PlanStatusCounts;
  loaded: boolean;
  loadError: Error | null;
};

/**
 * Custom hook to watch Kubernetes plans and return their counts by phase.
 * @return {PlanStatusCountsHookResponse} An object with 'count', 'loaded', and 'loadError' keys.
 */
const usePlanStatusCounts = (): PlanStatusCountsHookResponse => {
  const [plans, loaded, loadError] = toTypedWatchResult(
    useK8sWatchResource<V1beta1Plan[]>({
      groupVersionKind: PlanModelGroupVersionKind,
      isList: true,
      namespaced: true,
    }),
  );

  const planStatusCounts = useMemo(() => {
    if (!loaded || loadError) {
      return getPlanStatusCounts();
    }

    return getPlanStatusCounts(plans);
  }, [plans, loaded, loadError]);

  return {
    count: planStatusCounts,
    loaded,
    loadError,
  };
};

export default usePlanStatusCounts;
