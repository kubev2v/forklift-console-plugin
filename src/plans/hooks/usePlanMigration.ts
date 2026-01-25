import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { useK8sWatchResource, type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import {
  getCreatedAt,
  getNamespace,
  getOwnerReference,
  getUID,
} from '@utils/crds/common/selectors';

export const usePlanMigration = (plan: V1beta1Plan): WatchK8sResult<V1beta1Migration> => {
  const [migrations, migrationLoaded, migrationLoadError] = useK8sWatchResource<V1beta1Migration[]>(
    {
      groupVersionKind: MigrationModelGroupVersionKind,
      isList: true,
      namespace: getNamespace(plan),
      namespaced: true,
    },
  );

  const planMigrations = (
    migrations && migrationLoaded && !migrationLoadError ? migrations : []
  ).filter((migration) => getOwnerReference(migration)?.uid === getUID(plan));

  planMigrations?.sort(
    (migA, migB) =>
      new Date(getCreatedAt(migB) ?? '').getTime() - new Date(getCreatedAt(migA) ?? '').getTime(),
  );
  const [lastMigration] = planMigrations;

  return [lastMigration, migrationLoaded, migrationLoadError];
};
