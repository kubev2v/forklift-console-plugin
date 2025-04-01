import React from 'react';

import { MigrationModelGroupVersionKind, V1beta1Migration, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { MigrationsTable } from './components/MigrationsTable';
import { Suspend } from '../Suspend';

export const MigrationsSection: React.FC<MigrationsSectionProps> = ({ obj }) => {
  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: obj?.metadata?.namespace,
  });

  const ownedMigrations = migrations.filter(
    (m) => m?.metadata?.ownerReferences?.[0]?.uid === obj.metadata.uid,
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
