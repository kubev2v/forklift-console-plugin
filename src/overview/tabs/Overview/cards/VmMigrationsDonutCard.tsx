import { type FC, useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import { OverviewContext } from 'src/overview/context/OverviewContext';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import type { V1beta1ForkliftController } from '@forklift-ui/types';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { useVmMigrationsDataPoints } from '../hooks/useVmMigrationsDataPoints';
import { ChartColors } from '../utils/colors';
import { navigateToHistoryTab } from '../utils/navigate';
import { TimeRangeOptions } from '../utils/timeRangeOptions';
import type { ChartDatum } from '../utils/types';

import HeaderActions from './CardHeaderActions';

type VmMigrationsDonutCardProps = {
  loaded?: boolean;
  loadError?: unknown;
  obj?: V1beta1ForkliftController;
};

const VmMigrationsDonutCard: FC<VmMigrationsDonutCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { data, setData } = useContext(OverviewContext);
  const selectedRange = data?.vmMigrationsDonutSelectedRange ?? TimeRangeOptions.All;
  const setSelectedRange = (range: TimeRangeOptions): void => {
    setData({
      ...data,
      vmMigrationsDonutSelectedRange: range,
    });
  };
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const {
    loaded,
    loadError,
    obj,
    total,
    totalCanceledCount,
    totalFailedCount,
    totalRunningCount,
    totalSucceededCount,
  } = useVmMigrationsDataPoints(selectedRange, true);

  const colorScale =
    total === 0
      ? [ChartColors.Empty]
      : [ChartColors.Executing, ChartColors.Failure, ChartColors.Success, ChartColors.Canceled];

  const highlightColor =
    hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < colorScale.length
      ? colorScale[hoveredIndex]
      : ChartColors.Success;

  return (
    <Card className="pf-m-full-height">
      <CardHeader
        actions={{
          actions: (
            <HeaderActions
              selectedTimeRange={selectedRange}
              setSelectedTimeRange={setSelectedRange}
              showAll
            />
          ),
        }}
      >
        <CardTitle className="forklift-title">{t('Virtual machines')}</CardTitle>
      </CardHeader>
      <CardBody className="forklift-overview__status-migration pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-flex-direction-column">
        <div className="forklift-overview__status-migration-donut">
          <LoadingSuspend loaded={loaded} loadError={loadError} obj={obj}>
            <ChartDonut
              ariaDesc={t('Donut chart with VM migration statistics')}
              colorScale={colorScale}
              constrainToVisibleArea
              data={
                total === 0
                  ? [{ x: 'Empty state', y: 1 }]
                  : ([
                      { x: t('running'), y: totalRunningCount },
                      { x: t('failed'), y: totalFailedCount },
                      { x: t('succeeded'), y: totalSucceededCount },
                      { x: t('canceled'), y: totalCanceledCount },
                    ] as ChartDatum[])
              }
              events={[
                {
                  eventHandlers: {
                    onClick: (): void => {
                      if (total === 0) return;
                      const statusMap = ['Running', 'Failed', 'Succeeded', 'Canceled'];
                      const status = hoveredIndex === null ? undefined : statusMap[hoveredIndex];
                      navigateToHistoryTab({ navigate, selectedRange, status });
                    },
                    onMouseOut: (): { mutation: () => { active: boolean }; target: string }[] => {
                      setHoveredIndex(null);
                      return [
                        {
                          mutation: () => ({ active: false }),
                          target: 'labels',
                        },
                      ];
                    },
                    onMouseOver: (
                      _: unknown,
                      props: { index: number },
                    ): { mutation: () => { active: boolean }; target: string }[] => {
                      setHoveredIndex(props.index);
                      return [
                        {
                          mutation: () => ({ active: true }),
                          target: 'labels',
                        },
                      ];
                    },
                  },
                  target: 'data',
                },
              ]}
              innerRadius={88}
              labels={({ datum }: { datum: ChartDatum }) =>
                total === 0
                  ? (undefined as unknown as string)
                  : `${t('{{count}} VM migration', { count: datum.y })}
                        ${datum.x}`
              }
              style={{
                data: {
                  cursor: 'pointer',
                  stroke: ({ index }) => (hoveredIndex === index ? highlightColor : ''),
                  strokeWidth: ({ index }) => (hoveredIndex === index ? 2 : 1),
                },
              }}
              subTitle={t('Migrated')}
              title={`${totalSucceededCount ?? '0'}`}
            />
          </LoadingSuspend>
        </div>
      </CardBody>
    </Card>
  );
};

export default VmMigrationsDonutCard;
