import { useEffect, useState } from 'react';

import { PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getPlanStatusCounts } from '../utils/getPlanStatusCounts';

type PlanStatusCounts = Record<string, number>;

type PlanStatusCountsHookResponse = {
  count: PlanStatusCounts;
  loaded: boolean;
  loadError: Error | null;
};

type CountState = {
  planStatusCounts: PlanStatusCounts;
};

/**
 * Custom hook to watch Kubernetes plans and return their counts by phase.
 * Only triggers a re-render if the counts change.
 * @return {PlanStatusCountsHookResponse} An object with 'count', 'loaded', and 'loadError' keys.
 */
const usePlanStatusCounts = (): PlanStatusCountsHookResponse => {
  const initialPlanStatusCounts = getPlanStatusCounts();
  const [counts, setCounts] = useState<CountState>({
    planStatusCounts: initialPlanStatusCounts,
  });

  const [plans, loaded, loadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  // Update 'counts' whenever 'plans' changes and 'loaded' is true and 'loadError' is false.
  useEffect(() => {
    if (loaded && !loadError) {
      setCounts({
        planStatusCounts: getPlanStatusCounts(plans),
      });
    }
  }, [plans, loaded, loadError]);

  return {
    count: counts.planStatusCounts,
    loaded,
    loadError,
  };
};

export default usePlanStatusCounts;
