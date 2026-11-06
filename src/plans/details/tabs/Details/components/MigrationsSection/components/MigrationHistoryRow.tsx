import type { FC } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { useForkliftTranslation } from 'src/utils/i18n';

import HelpText from '@components/HelpText';
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
import { EMPTY_VALUE } from '@utils/format/formatConstants';
import { formatDuration } from '@utils/format/formatDuration';
import { formatThroughput } from '@utils/format/formatThroughput';
import { isEmpty } from '@utils/helpers';
import { getMigrationPerformanceStatusLabel } from '@utils/migrations/getMigrationPerformanceStatusLabel';
import { getMigrationResourcePerformance } from '@utils/migrations/migrationPerformance';
import { MIGRATION_PERFORMANCE_STATUS } from '@utils/migrations/migrationPerformanceConstants';

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
  const statusLabel = getMigrationPerformanceStatusLabel(
    performance.status,
    getMigrationStatusLabel(vmStatuses, migrationVMs.length),
    t,
  );

  const rowTestId = `migration-history-row-${performance.migrationUid}`;

  const getVmStatusLabel = (status: string): string => {
    if (status === MIGRATION_PERFORMANCE_STATUS.SUCCEEDED) {
      return t('Succeeded');
    }
    if (status === MIGRATION_PERFORMANCE_STATUS.FAILED) {
      return t('Failed');
    }
    if (status === MIGRATION_PERFORMANCE_STATUS.CANCELED) {
      return t('Canceled');
    }
    return status === MIGRATION_PERFORMANCE_STATUS.RUNNING ? t('Running') : t('Pending');
  };

  return (
    <>
      <Tr data-testid={rowTestId}>
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
            {statusLabel}
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
        <Td>{rate === undefined ? EMPTY_VALUE : formatThroughput(rate)}</Td>
      </Tr>
      {expanded && (
        <Tr isExpanded>
          <Td colSpan={COLUMN_COUNT}>
            {isEmpty(performance.vms) ? (
              <HelpText>{t('No per-VM data for this run.')}</HelpText>
            ) : (
              <Table data-testid="migration-history-vm-breakdown" variant="compact">
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
                      <Td>{getVmStatusLabel(vm.status)}</Td>
                      <Td>{formatBytes(vm.copiedBytes)}</Td>
                      <Td>{formatDuration(vm.transferSeconds)}</Td>
                      <Td>
                        {vm.transferRate === undefined
                          ? EMPTY_VALUE
                          : formatThroughput(vm.transferRate)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Td>
        </Tr>
      )}
    </>
  );
};

export default MigrationHistoryRow;
