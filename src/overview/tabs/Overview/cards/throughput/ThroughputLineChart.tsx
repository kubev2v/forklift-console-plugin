import { useMemo, useRef } from 'react';

import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { Bullseye } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { ThroughputSeries } from '../../hooks/useThroughputQuery';
import { ThroughputLineColors } from '../../utils/colors';
import { formatThroughput, formatThroughputTick } from '../../utils/formatThroughput';
import { useResizeObserver } from '../VmMigrationsHistory/useResizeObserver';

type ThroughputLineChartProps = {
  series: ThroughputSeries[];
  visiblePlanIds: string[];
};

type ChartDatum = {
  name: string;
  x: number;
  y: number;
};

const formatTimestamp = (ts: number): string => {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ThroughputLineChart = ({ series, visiblePlanIds }: ThroughputLineChartProps): JSX.Element => {
  const { t } = useForkliftTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartDimensions = useResizeObserver(chartContainerRef);

  const visibleSeries = useMemo(
    () => series.filter((item) => visiblePlanIds.includes(item.planId)),
    [series, visiblePlanIds],
  );

  const chartData = useMemo(
    (): { color: string; data: ChartDatum[]; name: string }[] =>
      visibleSeries.map((item, index) => ({
        color: ThroughputLineColors[index % ThroughputLineColors.length],
        data: item.values.map((point) => ({
          name: item.planName,
          x: point.timestamp,
          y: point.throughput,
        })),
        name: item.planName,
      })),
    [visibleSeries],
  );

  const legendData = useMemo(
    () => chartData.map((cd) => ({ name: cd.name, symbol: { fill: cd.color } })),
    [chartData],
  );

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
        padding={{ bottom: 55, left: 70, right: 20, top: 10 }}
        width={chartDimensions.width}
      >
        <ChartAxis fixLabelOverlap tickFormat={(ts: number) => formatTimestamp(ts)} tickCount={6} />
        <ChartAxis dependentAxis tickFormat={(val: number) => formatThroughputTick(val)} />
        <ChartGroup>
          {chartData.map((cd) => (
            <ChartLine
              key={cd.name}
              data={cd.data}
              name={cd.name}
              style={{ data: { stroke: cd.color, strokeWidth: 2 } }}
            />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default ThroughputLineChart;
