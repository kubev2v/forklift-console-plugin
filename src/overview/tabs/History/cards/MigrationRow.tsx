import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableLinkCell } from 'src/components/TableCell/TableLinkCell';
import VisibleTableData from 'src/components/TableCell/VisibleTableData';
import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';
import VMStatusIconsRow from 'src/plans/details/components/PlanStatus/VMStatusIconsRow';
import { getMigrationStatusLabel } from 'src/plans/details/tabs/Details/components/MigrationsSection/components/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import TableRow from '@components/common/DataViewTable/TableRow';
import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { Split, Tooltip } from '@patternfly/react-core';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { formatBytes } from '@utils/format/formatBytes';
import { EMPTY_VALUE } from '@utils/format/formatConstants';
import { formatDuration } from '@utils/format/formatDuration';
import { formatThroughput } from '@utils/format/formatThroughput';
import { getMigrationResourcePerformance } from '@utils/migrations/migrationPerformance';
import { MIGRATION_PERFORMANCE_STATUS } from '@utils/migrations/migrationPerformanceConstants';
import { shouldShowCopyTime } from '@utils/migrations/migrationPerformanceTime';

import type { LiveThroughputByPlan } from '../utils/liveThroughput';

type MigrationRowProps = RowProps<V1beta1Migration> & {
  liveRates?: LiveThroughputByPlan;
  plans: V1beta1Plan[];
};

const MigrationRow: FC<MigrationRowProps> = ({
  liveRates,
  plans,
  resourceData: migration,
  resourceFields,
}) => {
  const { t } = useForkliftTranslation();
  const plan = plans.find((pl) => {
    return (
      getUID(pl) === migration.spec?.plan?.uid ||
      (getName(pl) === migration.spec?.plan?.name &&
        getNamespace(pl) === migration.spec?.plan?.namespace)
    );
  });
  const migrationVMs = migration?.status?.vms;
  const vmStatuses = getMigrationVMsStatusCounts(migrationVMs ?? [], migrationVMs?.length ?? 0);
  const performance = getMigrationResourcePerformance(migration);
  const liveRate =
    performance.status === MIGRATION_PERFORMANCE_STATUS.RUNNING
      ? liveRates?.get(performance.planUid)
      : undefined;
  const rate = liveRate ?? performance.avgTransferRate;
  const isPartial = performance.status === MIGRATION_PERFORMANCE_STATUS.PARTIAL;
  const { durationSeconds, transferSeconds } = performance;
  const showsCopyTime = shouldShowCopyTime(durationSeconds, transferSeconds);
  const statusLabel = isPartial
    ? t('Partially migrated')
    : getMigrationStatusLabel(vmStatuses, migrationVMs?.length);

  const rowFields = {
    averageRate: <span>{rate === undefined ? EMPTY_VALUE : formatThroughput(rate)}</span>,
    completed: <ConsoleTimestamp timestamp={migration.status?.completed ?? ''} />,
    dataTransferred: (
      <div>
        <div>{formatBytes(performance.copiedBytes)}</div>
        {performance.expectedBytes > performance.copiedBytes && (
          <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">
            {t('of {{expected}}', { expected: formatBytes(performance.expectedBytes) })}
          </div>
        )}
      </div>
    ),
    duration: (
      <div>
        <div>{formatDuration(durationSeconds)}</div>
        {showsCopyTime && (
          <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">
            {t('Copy time: {{duration}}', {
              duration: formatDuration(transferSeconds),
            })}
          </div>
        )}
      </div>
    ),
    name: (
      <TableLinkCell
        groupVersionKind={MigrationModelGroupVersionKind}
        name={getName(migration)}
        namespace={getNamespace(migration)}
      />
    ),
    plan: (
      <TableLinkCell
        groupVersionKind={PlanModelGroupVersionKind}
        name={migration.spec?.plan?.name}
        namespace={migration.spec?.plan?.namespace}
      />
    ),
    started: <ConsoleTimestamp timestamp={migration.status?.started ?? ''} />,
    vms: (
      <Split hasGutter>
        {isPartial ? (
          <Tooltip
            content={t(
              'Data and rate include every VM that transferred data, including failed VMs.',
            )}
          >
            <span tabIndex={0}>{statusLabel}</span>
          </Tooltip>
        ) : (
          statusLabel
        )}
        {plan ? <VMStatusIconsRow plan={plan} statuses={vmStatuses} /> : null}
      </Split>
    ),
  };
  return (
    <TableRow>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          fieldId={resourceFieldId ?? ''}
          key={resourceFieldId}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as keyof typeof rowFields]}
        </VisibleTableData>
      ))}
    </TableRow>
  );
};

export default MigrationRow;
