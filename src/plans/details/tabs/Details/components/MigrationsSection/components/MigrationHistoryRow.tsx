import type { FC } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { getMigrationResourcePerformance } from 'src/plans/utils/migrationPerformance';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Split } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { formatBytes } from '@utils/format/formatBytes';
import { formatDuration } from '@utils/format/formatDuration';
import { formatThroughput } from '@utils/format/formatThroughput';

import { getMigrationStatusLabel } from './utils/utils';

type MigrationHistoryRowProps = {
  expanded: boolean;
  migration: V1beta1Migration;
  onToggle: () => void;
  plan: V1beta1Plan;
  planStatus: Parameters<typeof getMigrationVMsStatusCounts>[2];
  rowIndex: number;
};

const COLUMN_COUNT = 8;

const MigrationHistoryRow: FC<MigrationHistoryRowProps> = ({
  expanded,
  migration,
  onToggle,
  plan,
  planStatus,
  rowIndex,
}) => {
  const { t } = useForkliftTranslation();
  const migrationVMs = migration?.status?.vms ?? [];
  const vmStatuses = getMigrationVMsStatusCounts(migrationVMs, migrationVMs.length, planStatus);
  const performance = getMigrationResourcePerformance(migration);
  const rate = performance.avgTransferRate;

  return (
    <>
      <Tr>
        <Td expand={{ isExpanded: expanded, onToggle, rowIndex }} />
        <Td>
          <ResourceLink
            groupVersionKind={MigrationModelGroupVersionKind}
            name={getName(migration)}
            namespace={getNamespace(migration)}
          />
        </Td>
        <Td>
          <Split hasGutter>
            {getMigrationStatusLabel(vmStatuses, migrationVMs.length)}
            <VMStatusIconsRow plan={plan} statuses={vmStatuses} />
          </Split>
        </Td>
        <Td>
          <ConsoleTimestamp timestamp={migration?.status?.started ?? null} />
        </Td>
        <Td>
          <ConsoleTimestamp timestamp={migration?.status?.completed ?? null} />
        </Td>
        <Td>{formatDuration(performance.durationSeconds)}</Td>
        <Td>{formatBytes(performance.copiedBytes)}</Td>
        <Td>{rate ? formatThroughput(rate) : '—'}</Td>
      </Tr>
      {expanded && (
        <Tr isExpanded>
          <Td colSpan={COLUMN_COUNT}>
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('VM')}</Th>
                  <Th>{t('Status')}</Th>
                  <Th>{t('Data transferred')}</Th>
                  <Th>{t('Copy time')}</Th>
                  <Th>{t('Average rate')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {performance.vms.map((vm) => (
                  <Tr key={vm.id}>
                    <Td>{vm.name}</Td>
                    <Td>{vm.status}</Td>
                    <Td>{formatBytes(vm.copiedBytes)}</Td>
                    <Td>{formatDuration(vm.transferSeconds)}</Td>
                    <Td>{vm.transferRate ? formatThroughput(vm.transferRate) : '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Td>
        </Tr>
      )}
    </>
  );
};

export default MigrationHistoryRow;
