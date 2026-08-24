import type { FC } from 'react';

import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import { isVmInPostMigrationSetup } from '../../../../utils/utils';

import MigrationProgressTableRow from './MigrationProgressTableRow';

import './MigrationProgressTable.scss';

type MigrationProgressTableProps = {
  plan: V1beta1Plan;
  statusVM: V1beta1PlanStatusMigrationVms | undefined;
  targetNamespace?: string;
  vmCreated?: boolean;
  vmName?: string;
};

const MigrationProgressTable: FC<MigrationProgressTableProps> = ({
  plan,
  statusVM,
  targetNamespace,
  vmCreated,
  vmName,
}) => {
  const { t } = useForkliftTranslation();
  const pipeline = statusVM?.pipeline ?? [];
  const inPostMigrationSetup = isVmInPostMigrationSetup(statusVM);

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>{t('Name')}</Th>
          <Th>{t('Description')}</Th>
          <Th>{t('Completed at')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {(pipeline ?? []).map((pipe) => (
          <MigrationProgressTableRow
            inPostMigrationSetup={inPostMigrationSetup}
            key={pipe?.name}
            pipe={pipe}
            plan={plan}
            targetNamespace={targetNamespace}
            vmCreated={vmCreated}
            vmName={vmName}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default MigrationProgressTable;
