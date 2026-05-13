import { type FC, useMemo, useRef } from 'react';

import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartScatter,
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

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

const TIME_TICK_INTERVALS: Record<ThroughputTimeRange, number> = {
  [ThroughputTimeRange.Last1H]: 10 * MS_PER_MINUTE,
  [ThroughputTimeRange.Last24H]: 4 * MS_PER_HOUR,
  [ThroughputTimeRange.Last2D]: 12 * MS_PER_HOUR,
  [ThroughputTimeRange.Last30Min]: 5 * MS_PER_MINUTE,
  [ThroughputTimeRange.Last6H]: MS_PER_HOUR,
  [ThroughputTimeRange.Last7D]: 24 * MS_PER_HOUR,
};

const TARGET_TICK_COUNT = 5;
const BYTES_DIVISOR = 1024;

const computeTimeTicks = (domain: [number, number], timeRange: ThroughputTimeRange): number[] => {
  const interval = TIME_TICK_INTERVALS[timeRange];
  const start = Math.ceil(domain[0] / interval) * interval;
  const ticks: number[] = [];

  for (let ts = start; ts <= domain[1]; ts += interval) {
    ticks.push(ts);
  }

  return ticks;
};

const computeNiceTicks = (data: ChartLineEntry[]): number[] => {
  let max = 0;

  for (const entry of data) {
    for (const datum of entry.data) {
      if (datum.y > max) {
        max = datum.y;
      }
    }
  }

  if (max === 0) {
    return [0];
  }

  let displayMax = max;
  let unitMultiplier = 1;

  while (displayMax >= BYTES_DIVISOR) {
    displayMax /= BYTES_DIVISOR;
    unitMultiplier *= BYTES_DIVISOR;
  }

  const rough = displayMax / TARGET_TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;

  let step = 10 * magnitude;

  if (residual <= 1) {
    step = magnitude;
  } else if (residual <= 2) {
    step = 2 * magnitude;
  } else if (residual <= 5) {
    step = 5 * magnitude;
  }

  const ticks: number[] = [];

  for (let val = 0; val <= displayMax; val += step) {
    ticks.push(Math.round(val * unitMultiplier));
  }

  if (ticks[ticks.length - 1] < max) {
    ticks.push(Math.round((ticks[ticks.length - 1] / unitMultiplier + step) * unitMultiplier));
  }

  return ticks;
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

  /* eslint-disable react-hooks/exhaustive-deps -- series triggers recalculation of Date.now() */
  const xDomain = useMemo((): [number, number] => {
    const now = Date.now();
    const { timespan } = THROUGHPUT_TIME_RANGE_CONFIG[timeRange];
    return [now - timespan, now];
  }, [timeRange, series]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const timeTicks = useMemo(
    (): number[] => computeTimeTicks(xDomain, timeRange),
    [xDomain, timeRange],
  );

  const niceTicks = useMemo((): number[] => computeNiceTicks(chartData), [chartData]);

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
        padding={{ bottom: 75, left: 85, right: 20, top: 10 }}
        width={chartDimensions.width}
      >
        <ChartAxis
          fixLabelOverlap
          tickFormat={(ts: number) => formatTimestamp(ts, timeRange)}
          tickValues={timeTicks}
          style={{ tickLabels: { padding: 0 } }}
        />
        <ChartAxis
          dependentAxis
          tickFormat={(val: number) => formatThroughputTick(val)}
          tickValues={niceTicks}
        />
        <ChartGroup>
          {chartData
            .filter((cd) => cd.data.length > 1)
            .map((cd) => (
              <ChartLine key={cd.planId} data={cd.data} name={cd.name} />
            ))}
        </ChartGroup>
        {chartData
          .filter((cd) => cd.data.length === 1)
          .map((cd) => (
            <ChartScatter key={cd.planId} data={cd.data} name={cd.name} />
          ))}
      </Chart>
    </div>
  );
};

export default ThroughputLineChart;
