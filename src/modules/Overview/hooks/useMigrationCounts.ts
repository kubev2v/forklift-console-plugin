import { useEffect, useState } from 'react';

import { MigrationModelGroupVersionKind, V1beta1Migration } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getMigrationCounts, getVmCounts } from '../utils';

export type MigrationCounts = { [key: string]: number };

export interface MigrationCountsHookResponse {
  count: MigrationCounts;
  vmCount: MigrationCounts;
  loaded: boolean;
  loadError: Error | null;
}

type CountState = {
  migrationCounts: MigrationCounts;
  vmCounts: MigrationCounts;
};

/**
 * Custom hook to watch Kubernetes migrations and return their counts by phase.
 * Consolidates migration and vm counts into a single state.
 * Only triggers a re-render if the counts change.
 * @return {MigrationCountsHookResponse} An object with 'count', 'vmCount', 'loaded', and 'loadError' keys.
 */
export const useMigrationCounts = (): MigrationCountsHookResponse => {
  const [counts, setCounts] = useState<CountState>({
    migrationCounts: {
      Total: 0,
      Running: 0,
      Failure: 0,
      Successful: 0,
    },
    vmCounts: {
      Total: 0,
      Running: 0,
      Failure: 0,
      Successful: 0,
    },
  });

  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    namespaced: true,
    isList: true,
  });

  // Update 'counts' whenever 'migrations' changes and 'loaded' is true and 'loadError' is false.
  useEffect(() => {
    if (loaded && !loadError) {
      setCounts({
        migrationCounts: getMigrationCounts(migrations),
        vmCounts: getVmCounts(migrations),
      });
    }
  }, [migrations, loaded, loadError]);

  return {
    count: counts.migrationCounts,
    vmCount: counts.vmCounts,
    loaded,
    loadError,
  };
};

export default useMigrationCounts;
