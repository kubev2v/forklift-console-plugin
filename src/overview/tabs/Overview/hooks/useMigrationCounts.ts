import { useEffect, useState } from 'react';

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
const useMigrationCounts = (
  range: TimeRangeOptions = TimeRangeOptions.Last10Days,
): MigrationCountsHookResponse => {
  const [counts, setCounts] = useState<CountState>({
    migrationCounts: {
      Failure: 0,
      Running: 0,
      Successful: 0,
      Total: 0,
    },
    vmCounts: {
      Failure: 0,
      Running: 0,
      Successful: 0,
      Total: 0,
    },
  });

  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  // Update 'counts' whenever 'migrations' changes and 'loaded' is true and 'loadError' is false.
  useEffect(() => {
    if (loaded && !loadError) {
      setCounts({
        migrationCounts: getPlanMigrationCounts(migrations),
        vmCounts: getVmCounts(migrations, range),
      });
    }
  }, [migrations, loaded, loadError, range]);

  return {
    count: counts.migrationCounts,
    loaded,
    loadError,
    vmCount: counts.vmCounts,
  };
};

export default useMigrationCounts;
