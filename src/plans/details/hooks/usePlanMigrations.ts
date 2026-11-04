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
  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespace: plan ? getNamespace(plan) : undefined,
    namespaced: true,
  });

  const planMigrations = useMemo(() => {
    if (!plan) {
      return [];
    }

    return sortMigrationsByStartedAtDate(
      migrations.filter((migration) => getOwnerReference(migration)?.uid === getUID(plan)),
    );
  }, [migrations, plan]);

  return [planMigrations, loaded, loadError];
};
