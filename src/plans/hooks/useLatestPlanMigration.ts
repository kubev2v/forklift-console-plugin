import { useMemo } from 'react';
import { sortMigrationsByStartedAtDate } from 'src/plans/utils/sortMigrationsByStartedAtDate';

import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace, getOwnerReference, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

/**
 * Returns the most recent Migration CR owned by the plan (by status.started,
 * falling back to creationTimestamp), regardless of Running/Failed/Succeeded.
 * Used to scope migration-created resources (pods, PVCs, …) to a single run.
 */
export const useLatestPlanMigration = (
  plan: V1beta1Plan,
): [V1beta1Migration | undefined, boolean, Error | undefined] => {
  const [migrations, migrationLoaded, migrationLoadError] = useK8sWatchResource<V1beta1Migration[]>(
    {
      groupVersionKind: MigrationModelGroupVersionKind,
      isList: true,
      namespace: getNamespace(plan),
      namespaced: true,
    },
  );

  const latestMigration = useMemo(() => {
    if (!migrationLoaded || migrationLoadError || isEmpty(migrations)) {
      return undefined;
    }

    const planMigrations = migrations.filter(
      (migration) => getOwnerReference(migration)?.uid === getUID(plan),
    );

    if (isEmpty(planMigrations)) {
      return undefined;
    }

    return sortMigrationsByStartedAtDate(planMigrations)[0];
  }, [migrations, migrationLoaded, migrationLoadError, plan]);

  return [latestMigration, migrationLoaded, migrationLoadError as Error | undefined];
};
