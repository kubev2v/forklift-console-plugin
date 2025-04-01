import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource, type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

export const usePlanMigration = (plan: V1beta1Plan): WatchK8sResult<V1beta1Migration> => {
  const [migrations, migrationLoaded, migrationLoadError] = useK8sWatchResource<V1beta1Migration[]>(
    {
      groupVersionKind: MigrationModelGroupVersionKind,
      isList: true,
      namespace: plan?.metadata?.namespace,
      namespaced: true,
    },
  );

  const planMigrations = (
    migrations && migrationLoaded && !migrationLoadError ? migrations : []
  ).filter((m) => m?.metadata?.ownerReferences?.[0]?.uid === plan?.metadata?.uid);

  planMigrations?.sort(
    (a, b) =>
      new Date(b.metadata.creationTimestamp).getTime() -
      new Date(a.metadata.creationTimestamp).getTime(),
  );
  const lastMigration = planMigrations[0];

  return [lastMigration, migrationLoaded, migrationLoadError];
};
