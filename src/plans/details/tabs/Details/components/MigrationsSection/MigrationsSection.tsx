import { type FC, useMemo } from 'react';

import LoadingSuspend from '@components/LoadingSuspend';
import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace, getOwnerReference, getUID } from '@utils/crds/common/selectors';

import MigrationsTable from './components/MigrationsTable';
import { sortMigrationsByStartedAtDate } from './utils/utils';

type MigrationsSectionProps = {
  plan: V1beta1Plan;
};

const MigrationsSection: FC<MigrationsSectionProps> = ({ plan }) => {
  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespace: getNamespace(plan),
    namespaced: true,
  });

  const planMigrations = useMemo(() => {
    const filtered = migrations.filter(
      (migration) => getOwnerReference(migration)?.uid === getUID(plan),
    );
    return sortMigrationsByStartedAtDate(filtered);
  }, [migrations, plan]);

  return (
    <LoadingSuspend obj={planMigrations} loaded={loaded} loadError={loadError}>
      <MigrationsTable migrations={planMigrations} plan={plan} />
    </LoadingSuspend>
  );
};

export default MigrationsSection;
