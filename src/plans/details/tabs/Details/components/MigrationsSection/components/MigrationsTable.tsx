import { type FC, useState } from 'react';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/planStatusResolver';
import { useForkliftTranslation } from 'src/utils/i18n';

import HelpText from '@components/HelpText';
import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import MigrationHistoryRow from './MigrationHistoryRow';

type MigrationTableProps = {
  migrations: V1beta1Migration[];
  plan: V1beta1Plan;
};

const MigrationsTable: FC<MigrationTableProps> = ({ migrations, plan }) => {
  const { t } = useForkliftTranslation();
  const [expanded, setExpanded] = useState<string[]>([]);

  if (isEmpty(migrations)) {
    return (
      <HelpText className="pf-v6-u-mt-md">
        {t('The plan has not been executed for migration.')}
      </HelpText>
    );
  }

  const planStatus = getPlanStatus(plan);
  const toggle = (uid: string): void => {
    setExpanded((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]));
  };

  return (
    <Table data-testid="plan-migration-history">
      <Thead>
        <Tr>
          <Th />
          <Th width={15}>{t('Migration')}</Th>
          <Th width={15}>{t('VMs')}</Th>
          <Th width={10}>{t('Started at')}</Th>
          <Th width={10}>{t('Completed at')}</Th>
          <Th width={10}>{t('Duration')}</Th>
          <Th width={10}>{t('Data transferred')}</Th>
          <Th width={10}>{t('Average rate')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {migrations.map((migration, rowIndex) => {
          const uid = getUID(migration) ?? '';

          return (
            <MigrationHistoryRow
              expanded={expanded.includes(uid)}
              key={uid}
              migration={migration}
              onToggle={() => {
                toggle(uid);
              }}
              plan={plan}
              planStatus={planStatus}
              rowIndex={rowIndex}
            />
          );
        })}
      </Tbody>
    </Table>
  );
};

export default MigrationsTable;
