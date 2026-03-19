import { type FC, useMemo, useRef } from 'react';

import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { Bullseye } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { ThroughputSeries } from '../../hooks/useThroughputQuery';
import { formatThroughput, formatThroughputTick } from '../../utils/formatThroughput';
import {
  THROUGHPUT_TIME_RANGE_CONFIG,
  ThroughputTimeRange,
} from '../../utils/throughputTimeRanges';
import { useResizeObserver } from '../VmMigrationsHistory/useResizeObserver';

type ThroughputLineChartProps = {
  series: ThroughputSeries[];
  timeRange: ThroughputTimeRange;
  title: string;
  visiblePlanIds: string[];
};

type ChartDatum = {
  name: string;
  x: number;
  y: number;
};

const SHORT_RANGES = new Set<ThroughputTimeRange>([
  ThroughputTimeRange.Last30Min,
  ThroughputTimeRange.Last1H,
  ThroughputTimeRange.Last6H,
]);

const TICK_COUNTS: Record<ThroughputTimeRange, number> = {
  [ThroughputTimeRange.Last1H]: 6,
  [ThroughputTimeRange.Last24H]: 5,
  [ThroughputTimeRange.Last2D]: 4,
  [ThroughputTimeRange.Last30Min]: 6,
  [ThroughputTimeRange.Last6H]: 6,
  [ThroughputTimeRange.Last7D]: 5,
};

const formatTimestamp = (ts: number, timeRange: ThroughputTimeRange): string => {
  const date = new Date(ts);

  if (SHORT_RANGES.has(timeRange)) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const datePart = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${datePart}\n${timePart}`;
};

type ChartLineEntry = {
  data: ChartDatum[];
  name: string;
  planId: string;
};

const ThroughputLineChart: FC<ThroughputLineChartProps> = ({
  series,
  timeRange,
  title,
  visiblePlanIds,
}) => {
  const { t } = useForkliftTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartDimensions = useResizeObserver(chartContainerRef);

  const visibleSeries = useMemo(
    () => series.filter((item) => visiblePlanIds.includes(item.planId)),
    [series, visiblePlanIds],
  );

  const chartData = useMemo(
    (): ChartLineEntry[] =>
      visibleSeries.map((item) => ({
        data: item.values.map((point) => ({
          name: item.planName,
          x: point.timestamp,
          y: point.throughput,
        })),
        name: item.planName,
        planId: item.planId,
      })),
    [visibleSeries],
  );

  const legendData = useMemo(() => chartData.map((cd) => ({ name: cd.name })), [chartData]);

  const xDomain = useMemo((): [number, number] => {
    const now = Date.now();
    const { timespan } = THROUGHPUT_TIME_RANGE_CONFIG[timeRange];
    return [now - timespan, now];
  }, [timeRange]);

  if (isEmpty(visibleSeries)) {
    return (
      <div ref={chartContainerRef} className="pf-v6-u-h-100 pf-v6-u-w-100">
        <Bullseye>{t('No active migration data available')}</Bullseye>
      </div>
    );
  }

  return (
    <div ref={chartContainerRef} className="pf-v6-u-h-100 pf-v6-u-w-100">
      <Chart
        ariaDesc={t('Line chart showing throughput over time')}
        ariaTitle={title}
        domain={{ x: xDomain }}
        themeColor={ChartThemeColor.multiUnordered}
        containerComponent={
          <ChartVoronoiContainer
            constrainToVisibleArea
            labels={({ datum }: { datum: ChartDatum }) =>
              datum.name ? `${datum.name}: ${formatThroughput(datum.y)}` : ''
            }
          />
        }
        height={chartDimensions.height}
        legendData={legendData}
        legendPosition="bottom"
        minDomain={{ y: 0 }}
        padding={{ bottom: 75, left: 70, right: 20, top: 10 }}
        width={chartDimensions.width}
      >
        <ChartAxis
          fixLabelOverlap
          tickFormat={(ts: number) => formatTimestamp(ts, timeRange)}
          tickCount={TICK_COUNTS[timeRange]}
          style={{ tickLabels: { padding: 0 } }}
        />
        <ChartAxis dependentAxis tickFormat={(val: number) => formatThroughputTick(val)} />
        <ChartGroup>
          {chartData.map((cd) => (
            <ChartLine key={cd.planId} data={cd.data} name={cd.name} />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default ThroughputLineChart;
