import type { FC } from 'react';

import LoadingSuspend from '@components/LoadingSuspend';
import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';

import MigrationsTable from './components/MigrationsTable';

type MigrationsSectionProps = {
  loaded: boolean;
  loadError: Error | null;
  migrations: V1beta1Migration[];
  plan: V1beta1Plan;
};

const MigrationsSection: FC<MigrationsSectionProps> = ({ loaded, loadError, migrations, plan }) => (
  <LoadingSuspend loaded={loaded} loadError={loadError} obj={migrations}>
    <MigrationsTable migrations={migrations} plan={plan} />
  </LoadingSuspend>
);

export default MigrationsSection;
