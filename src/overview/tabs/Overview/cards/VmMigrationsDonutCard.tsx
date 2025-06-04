import { type FC, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { DateTime } from 'luxon';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { CreateOverviewContext } from 'src/overview/hooks/OverviewContext';
import { PlanTableResourceId } from 'src/plans/list/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef, type V1beta1ForkliftController } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import useMigrationCounts from '../hooks/useMigrationCounts';
import { ChartColors } from '../utils/colors';
import { TimeRangeOptions, TimeRangeOptionsDictionary } from '../utils/timeRangeOptions';
import type { ChartDatum } from '../utils/types';

import HeaderActions from './CardHeaderActions';

type VmMigrationsDonutCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

const VmMigrationsDonutCard: FC<VmMigrationsDonutCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { data, setData } = useContext(CreateOverviewContext);
  const selectedRange = data?.vmMigrationsDonutSelectedRange ?? TimeRangeOptions.All;
  const setSelectedRange = (range: TimeRangeOptions) => {
    setData({
      ...data,
      vmMigrationsDonutSelectedRange: range,
    });
  };
  const { vmCount } = useMigrationCounts(selectedRange);
  const [activeNamespace] = useActiveNamespace();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const plansListURL = useMemo(() => {
    return getResourceUrl({
      namespace: activeNamespace,
      namespaced: true,
      reference: PlanModelRef,
    });
  }, [activeNamespace]);

  const colorScale =
    vmCount.Total === 0
      ? [ChartColors.Empty]
      : [ChartColors.Executing, ChartColors.Failure, ChartColors.Success, ChartColors.Canceled];

  const highlightColor =
    hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < colorScale.length
      ? colorScale[hoveredIndex]
      : ChartColors.Success;

  return (
    <Card>
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
        <CardTitle className="forklift-title">{t('Virtual Machines')}</CardTitle>
      </CardHeader>
      <CardBody className="forklift-status-migration pf-v5-u-display-flex pf-v5-u-align-items-center pf-v5-u-flex-direction-column">
        <div className="forklift-status-migration-donut">
          <ChartDonut
            ariaDesc={t('Donut chart with VM migration statistics')}
            colorScale={colorScale}
            constrainToVisibleArea
            data={
              vmCount.Total === 0
                ? [{ x: 'Empty state', y: 1 }]
                : ([
                    { x: t('running'), y: vmCount.Running },
                    { x: t('failed'), y: vmCount.Failed },
                    { x: t('succeeded'), y: vmCount.Succeeded },
                    { x: t('canceled'), y: vmCount.Canceled },
                  ] as ChartDatum[])
            }
            labels={({ datum }: { datum: ChartDatum }) =>
              vmCount.Total === 0
                ? (undefined as unknown as string)
                : `${t('{{count}} VM migration', { count: datum.y })}
                        ${datum.x}`
            }
            title={`${vmCount?.Succeeded ?? '0'}`}
            subTitle={t('Migrated')}
            innerRadius={88}
            events={[
              {
                eventHandlers: {
                  onClick: () => {
                    const dateEnd = DateTime.now().toUTC();
                    const dateStart = dateEnd.minus(TimeRangeOptionsDictionary[selectedRange].span);
                    const rangeString = `${dateStart.toFormat('yyyy-MM-dd')}/${dateEnd.toFormat('yyyy-MM-dd')}`;
                    const param = encodeURIComponent(JSON.stringify([rangeString]));
                    navigate(`${plansListURL}?${PlanTableResourceId.MigrationStarted}=${param}`);
                    return null;
                  },
                  onMouseOut: () => {
                    setHoveredIndex(null);
                    return [
                      {
                        mutation: () => ({ active: false }),
                        target: 'labels',
                      },
                    ];
                  },
                  onMouseOver: (_, props: { index: number }) => {
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
            style={{
              data: {
                cursor: 'pointer',
                stroke: ({ index }) => (hoveredIndex === index ? highlightColor : ''),
                strokeWidth: ({ index }) => (hoveredIndex === index ? 2 : 1),
              },
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default VmMigrationsDonutCard;
