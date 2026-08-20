import { useMemo } from 'react';

import { MigrationModelGroupVersionKind, type V1beta1Migration } from '@forklift-ui/types';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import { getPlanMigrationCounts } from '../utils/getMigrationCounts';
import { getVmCounts } from '../utils/getVmCounts';
import { TimeRangeOptions } from '../utils/timeRangeOptions';

type MigrationCounts = {
  Canceled: number;
  Failure: number;
  Running: number;
  Successful: number;
  Total: number;
};

type MigrationCountsHookResponse = {
  count: MigrationCounts;
  loaded: boolean;
  loadError: Error | null;
  vmCount: MigrationCounts;
};

const EMPTY_COUNTS: MigrationCounts = {
  Canceled: 0,
  Failure: 0,
  Running: 0,
  Successful: 0,
  Total: 0,
};

/**
 * Helpers use condition type names (Failed/Succeeded); consumers expect Failure/Successful.
 */
const normalizeCounts = (counts: Record<string, number>): MigrationCounts => ({
  Canceled: counts.Canceled ?? 0,
  Failure: counts.Failed ?? counts.Failure ?? 0,
  Running: counts.Running ?? 0,
  Successful: counts.Succeeded ?? counts.Successful ?? 0,
  Total: counts.Total ?? 0,
});

/**
 * Custom hook to watch Kubernetes migrations and return their counts by phase.
 * Consolidates migration and vm counts into a single derived value.
 * @return {MigrationCountsHookResponse} An object with 'count', 'vmCount', 'loaded', and 'loadError' keys.
 */
const useMigrationCounts = (
  range: TimeRangeOptions = TimeRangeOptions.Last10Days,
): MigrationCountsHookResponse => {
  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  const counts = useMemo(() => {
    if (!loaded || loadError) {
      return {
        migrationCounts: EMPTY_COUNTS,
        vmCounts: EMPTY_COUNTS,
      };
    }

    return {
      migrationCounts: normalizeCounts(getPlanMigrationCounts(migrations)),
      vmCounts: normalizeCounts(getVmCounts(migrations, range)),
    };
  }, [migrations, loaded, loadError, range]);

  return {
    count: counts.migrationCounts,
    loaded,
    loadError,
    vmCount: counts.vmCounts,
  };
};

export default useMigrationCounts;
