import type { FC } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import {
  getMigrationVMsStatusCounts,
  getPlanStatus,
} from 'src/plans/details/components/PlanStatus/utils/utils';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { useForkliftTranslation } from 'src/utils/i18n';

import HelpText from '@components/HelpText';
import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Split } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import { getMigrationStatusLabel } from './utils/utils';

type MigrationTableProps = {
  migrations: V1beta1Migration[];
  plan: V1beta1Plan;
};

const MigrationsTable: FC<MigrationTableProps> = ({ migrations, plan }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(migrations)) {
    return (
      <HelpText className="pf-v6-u-mt-md">
        {t('The plan has not been executed for migration.')}
      </HelpText>
    );
  }

  const planStatus = getPlanStatus(plan);
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
        {migrations.map((migration) => {
          const migrationVMs = migration?.status?.vms;
          const vmStatuses = getMigrationVMsStatusCounts(
            migrationVMs ?? [],
            planStatus,
            migrationVMs?.length ?? 0,
          );

          return (
            <Tr key={getUID(migration)}>
              <Td>
                <ResourceLink
                  groupVersionKind={MigrationModelGroupVersionKind}
                  name={getName(migration)}
                  namespace={getNamespace(migration)}
                />
              </Td>
              <Td>
                <Split hasGutter>
                  {getMigrationStatusLabel(vmStatuses, migrationVMs?.length)}
                  <ModalHOC>
                    <VMStatusIconsRow statuses={vmStatuses} plan={plan} />
                  </ModalHOC>
                </Split>
              </Td>
              <Td>
                <ConsoleTimestamp timestamp={migration?.status?.started ?? null} />
              </Td>
              <Td>
                <ConsoleTimestamp timestamp={migration?.status?.completed ?? null} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default MigrationsTable;
