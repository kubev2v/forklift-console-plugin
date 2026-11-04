import { type FC, useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Migration } from '@forklift-ui/types';
import { Card, CardBody, Gallery } from '@patternfly/react-core';
import { formatBytes } from '@utils/format/formatBytes';
import { EMPTY_VALUE } from '@utils/format/formatConstants';
import { formatDuration } from '@utils/format/formatDuration';
import { formatThroughput } from '@utils/format/formatThroughput';
import { isEmpty } from '@utils/helpers';
import { getMigrationResourcePerformance } from '@utils/migrations/migrationPerformance';
import {
  MIGRATION_PERFORMANCE_STATUS,
  type MigrationPerformanceStatus,
} from '@utils/migrations/migrationPerformanceConstants';

const FINISHED_STATUSES: MigrationPerformanceStatus[] = [
  MIGRATION_PERFORMANCE_STATUS.FAILED,
  MIGRATION_PERFORMANCE_STATUS.PARTIAL,
  MIGRATION_PERFORMANCE_STATUS.SUCCEEDED,
];

const getMedian = (values: number[]): number | undefined => {
  if (isEmpty(values)) {
    return undefined;
  }

  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 0 ? (values[middle - 1] + values[middle]) / 2 : values[middle];
};

type MigrationPerformanceSummaryProps = {
  loaded: boolean;
  migrations: V1beta1Migration[];
};

const MigrationPerformanceSummary: FC<MigrationPerformanceSummaryProps> = ({
  loaded,
  migrations,
}) => {
  const { t } = useForkliftTranslation();

  const stats = useMemo(() => {
    const performances = migrations.map((migration) => getMigrationResourcePerformance(migration));
    const finished = performances.filter((performance) =>
      FINISHED_STATUSES.includes(performance.status),
    );
    const durations = finished
      .map((performance) => performance.durationSeconds)
      .filter((value): value is number => value !== undefined)
      .sort((a, b) => a - b);
    const rates = finished
      .map((performance) => performance.avgTransferRate)
      .filter((value): value is number => value !== undefined && value > 0);

    return {
      avgRate: rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : undefined,
      medianDuration: getMedian(durations),
      running: performances.filter(
        (performance) => performance.status === MIGRATION_PERFORMANCE_STATUS.RUNNING,
      ).length,
      totalBytes: performances.reduce((sum, performance) => sum + performance.copiedBytes, 0),
      totalRuns: performances.length,
    };
  }, [migrations]);

  if (!loaded) {
    return null;
  }

  const items = [
    {
      hint: t('{{running}} running', { running: stats.running }),
      label: t('Migration runs'),
      value: String(stats.totalRuns),
    },
    {
      hint: t('All runs'),
      label: t('Data transferred'),
      value: formatBytes(stats.totalBytes),
    },
    {
      hint: t('Finished runs'),
      label: t('Median duration'),
      value: formatDuration(stats.medianDuration),
    },
    {
      hint: t('Finished runs'),
      label: t('Average rate'),
      value: stats.avgRate ? formatThroughput(stats.avgRate) : EMPTY_VALUE,
    },
  ];

  return (
    <Gallery className="pf-v6-u-mb-xl" hasGutter minWidths={{ default: '180px' }}>
      {items.map((item) => (
        <Card isCompact key={item.label}>
          <CardBody>
            <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">{item.label}</div>
            <div className="pf-v6-u-font-size-2xl pf-v6-u-font-weight-bold">{item.value}</div>
            <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">{item.hint}</div>
          </CardBody>
        </Card>
      ))}
    </Gallery>
  );
};

export default MigrationPerformanceSummary;
