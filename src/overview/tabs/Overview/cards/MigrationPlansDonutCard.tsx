import { type FC, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef, type V1beta1ForkliftController } from '@forklift-ui/types';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { getResourceUrl } from '@utils/getResourceUrl';

import usePlanStatusCounts from '../hooks/usePlanStatusCounts';
import { ChartColors } from '../utils/colors';
import type { ChartDatum } from '../utils/types';

type MigrationPlansDonutCardProps = {
  loaded?: boolean;
  loadError?: unknown;
  obj?: V1beta1ForkliftController;
};

const MigrationPlansDonutCard: FC<MigrationPlansDonutCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { count } = usePlanStatusCounts();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const plansListURL = useMemo(() => {
    return getResourceUrl({
      namespaced: true,
      reference: PlanModelRef,
    });
  }, []);

  const data =
    count.Total === 0
      ? [{ phase: '', x: 'Empty state', y: 1 }]
      : [
          { phase: PlanStatuses.Archived, x: t('archived'), y: count.Archived },
          { phase: PlanStatuses.Canceled, x: t('canceled'), y: count.Canceled },
          { phase: PlanStatuses.CannotStart, x: t('cannot start'), y: count.CannotStart },
          { phase: PlanStatuses.Completed, x: t('completed'), y: count.Completed },
          { phase: PlanStatuses.Executing, x: t('executing'), y: count.Executing },
          { phase: PlanStatuses.Incomplete, x: t('incomplete'), y: count.Incomplete },
          { phase: PlanStatuses.Paused, x: t('paused'), y: count.Paused },
          { phase: PlanStatuses.Ready, x: t('not started'), y: count.Ready },
          { phase: PlanStatuses.Unknown, x: t('unknown'), y: count.Unknown },
        ];

  const colorScale =
    count.Total === 0
      ? [ChartColors.Empty]
      : [
          ChartColors.Archived,
          ChartColors.Canceled,
          ChartColors.CannotStart,
          ChartColors.Completed,
          ChartColors.Executing,
          ChartColors.Incomplete,
          ChartColors.Paused,
          ChartColors.NotStarted,
          ChartColors.Unknown,
        ];

  const highlightColor =
    hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < colorScale.length
      ? colorScale[hoveredIndex]
      : ChartColors.Success;

  return (
    <Card className="pf-m-full-height">
      <CardTitle className="forklift-title">{t('Migration plans')}</CardTitle>
      <CardBody className="forklift-overview__status-migration pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-flex-direction-column">
        <div className="forklift-overview__status-migration-donut">
          <ChartDonut
            ariaDesc={t('Donut chart with migration plans statistics')}
            colorScale={colorScale}
            constrainToVisibleArea
            data={data}
            events={[
              {
                eventHandlers: {
                  onClick: (_: unknown, props: { index: number }): null => {
                    // Get the phase from the clicked slice
                    const phase = data[props.index]?.phase;
                    // Build the URL with the phase param as a JSON array
                    const params = new URLSearchParams({
                      phase: JSON.stringify([phase]),
                    });
                    navigate(`${plansListURL}?${params.toString()}`)?.catch(() => undefined);
                    return null;
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
              count.Total === 0
                ? (undefined as unknown as string)
                : `${t('{{count}} plan', { count: datum.y })}
            ${datum.x}`
            }
            style={{
              data: {
                cursor: 'pointer',
                stroke: ({ index }) => (hoveredIndex === index ? highlightColor : ''),
                strokeWidth: ({ index }) => (hoveredIndex === index ? 2 : 1),
              },
            }}
            subTitle={t('Plans')}
            title={`${count?.Total ?? '0'}`}
          />
        </div>
        <div>
          <Link to={plansListURL}>{t('View all plans')}</Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default MigrationPlansDonutCard;
