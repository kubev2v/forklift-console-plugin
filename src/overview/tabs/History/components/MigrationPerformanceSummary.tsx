import { type FC, useMemo } from 'react';
import { getMigrationResourcePerformance } from 'src/plans/utils/migrationPerformance';
import type { MigrationPerformanceStatus } from 'src/plans/utils/migrationPerformanceTypes';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Migration } from '@forklift-ui/types';
import { Card, CardBody, Gallery } from '@patternfly/react-core';
import { formatBytes } from '@utils/format/formatBytes';
import { formatDuration } from '@utils/format/formatDuration';
import { formatThroughput } from '@utils/format/formatThroughput';

const FINISHED_STATUSES: MigrationPerformanceStatus[] = ['Failed', 'Partial', 'Succeeded'];

type MigrationPerformanceSummaryProps = {
  migrations: V1beta1Migration[];
};

const MigrationPerformanceSummary: FC<MigrationPerformanceSummaryProps> = ({ migrations }) => {
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
      medianDuration: durations[Math.floor(durations.length / 2)],
      running: performances.filter((performance) => performance.status === 'Running').length,
      totalBytes: performances.reduce((sum, performance) => sum + performance.copiedBytes, 0),
      totalRuns: performances.length,
    };
  }, [migrations]);

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
      value: stats.avgRate ? formatThroughput(stats.avgRate) : '—',
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
