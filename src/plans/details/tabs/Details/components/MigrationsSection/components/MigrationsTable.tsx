import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import HelpText from '@components/HelpText';
import type { V1beta1Migration, V1beta1Plan } from '@kubev2v/types';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import MigrationsTableRow from './MigrationsTableRow';

type MigrationTableProps = {
  migrations: V1beta1Migration[];
  plan?: V1beta1Plan;
};

const MigrationsTable: FC<MigrationTableProps> = ({ migrations, plan }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(migrations)) {
    return plan ? (
      <HelpText>{t('The plan has not been executed for migration.')}</HelpText>
    ) : (
      <HelpText>{t('No plan migrations have been executed.')}</HelpText>
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th width={20}>{t('Migration')}</Th>
          <Th width={15}>{t('VMs')}</Th>
          {!plan && <Th width={15}>{t('Plan')}</Th>}
          <Th>{t('Started at')}</Th>
          <Th>{t('Completed at')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {migrations.map((migration) => (
          <MigrationsTableRow migration={migration} plan={plan} showPlanColumn={!plan} />
        ))}
      </Tbody>
    </Table>
  );
};

export default MigrationsTable;
