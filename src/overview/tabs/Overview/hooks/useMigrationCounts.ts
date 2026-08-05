import { useMemo } from 'react';

import { MigrationModelGroupVersionKind, type V1beta1Migration } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getPlanMigrationCounts } from '../utils/getMigrationCounts';
import { getVmCounts } from '../utils/getVmCounts';
import { TimeRangeOptions } from '../utils/timeRangeOptions';

type MigrationCounts = Record<string, number>;

type MigrationCountsHookResponse = {
  count: MigrationCounts;
  vmCount: MigrationCounts;
  loaded: boolean;
  loadError: Error | null;
};

const EMPTY_COUNTS: MigrationCounts = {
  Failure: 0,
  Running: 0,
  Successful: 0,
  Total: 0,
};

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
      migrationCounts: getPlanMigrationCounts(migrations),
      vmCounts: getVmCounts(migrations, range),
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
