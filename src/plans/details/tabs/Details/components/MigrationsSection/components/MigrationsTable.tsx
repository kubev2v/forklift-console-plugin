import type { FC } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { useForkliftTranslation } from 'src/utils/i18n';

import HelpText from '@components/HelpText';
import { MigrationModelGroupVersionKind, type V1beta1Migration } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import MigrationProgressLabel from './MigrationProgressLabel';

type MigrationTableProps = {
  migrations: V1beta1Migration[];
};

const MigrationsTable: FC<MigrationTableProps> = ({ migrations }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(migrations)) {
    return <HelpText>{t('The plan has not been executed for migration.')}</HelpText>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th width={20}>{t('Migration')}</Th>
          <Th width={15}>{t('VMs')}</Th>
          <Th width={10}>{t('Started at')}</Th>
          <Th width={10}>{t('Completed at')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {migrations.map((migration) => (
          <Tr key={getUID(migration)}>
            <Td>
              <ResourceLink
                groupVersionKind={MigrationModelGroupVersionKind}
                name={getName(migration)}
                namespace={getNamespace(migration)}
              />
            </Td>
            <Td>
              <MigrationProgressLabel migration={migration} />
            </Td>
            <Td>
              <ConsoleTimestamp timestamp={migration?.status?.started} />
            </Td>
            <Td>
              <ConsoleTimestamp timestamp={migration?.status?.completed} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default MigrationsTable;
