import type { FC } from 'react';

import Suspend from '@components/Suspend';
import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationsTable } from './components/MigrationsTable';

export const MigrationsSection: FC<MigrationsSectionProps> = ({ obj }) => {
  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespace: obj?.metadata?.namespace,
    namespaced: true,
  });

  const ownedMigrations = migrations.filter(
    (migration) => migration?.metadata?.ownerReferences?.[0]?.uid === obj.metadata.uid,
  );

  return (
    <Suspend obj={ownedMigrations} loaded={loaded} loadError={loadError}>
      <MigrationsTable migrations={ownedMigrations} />
    </Suspend>
  );
};

type MigrationsSectionProps = {
  obj: V1beta1Plan;
};
