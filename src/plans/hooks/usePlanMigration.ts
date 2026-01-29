import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { CONDITION_STATUS } from '@utils/constants';
import { getNamespace, getOwnerReference, getUID } from '@utils/crds/common/selectors';

export const usePlanMigration = (
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

  const planMigrations = (
    migrations && migrationLoaded && !migrationLoadError ? migrations : []
  ).filter((migration) => getOwnerReference(migration)?.uid === getUID(plan));

  const activeMigration = planMigrations.find((migration) =>
    migration?.status?.conditions?.some(
      (condition) => condition?.status === CONDITION_STATUS.TRUE && condition?.type === 'Running',
    ),
  );

  return [activeMigration, migrationLoaded, migrationLoadError as Error | undefined];
};
