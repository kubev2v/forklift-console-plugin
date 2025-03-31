import React from 'react';

import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { Suspend } from '../Suspend';

import { MigrationsTable } from './components';

export const MigrationsSection: React.FC<MigrationsSectionProps> = ({ obj }) => {
  const [migrations, loaded, loadError] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespace: obj?.metadata?.namespace,
    namespaced: true,
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

export type MigrationsSectionProps = {
  obj: V1beta1Plan;
};
