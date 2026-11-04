import { useMemo } from 'react';
import { sortMigrationsByStartedAtDate } from 'src/plans/utils/sortMigrationsByStartedAtDate';

import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { getNamespace, getOwnerReference, getUID } from '@utils/crds/common/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

export const usePlanMigrations = (
  plan?: V1beta1Plan,
): [V1beta1Migration[], boolean, Error | null] => {
  const namespace = plan ? getNamespace(plan) : undefined;

  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>(
    namespace
      ? {
          groupVersionKind: MigrationModelGroupVersionKind,
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  const planMigrations = useMemo(() => {
    if (!plan || !namespace) {
      return [];
    }

    return sortMigrationsByStartedAtDate(
      migrations.filter((migration) => getOwnerReference(migration)?.uid === getUID(plan)),
    );
  }, [migrations, namespace, plan]);

  return [planMigrations, Boolean(namespace) && loaded, loadError];
};
