import { type FC, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef, type V1beta1ForkliftController } from '@kubev2v/types';
import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import usePlanStatusCounts from '../hooks/usePlanStatusCounts';
import { ChartColors } from '../utils/colors';
import type { ChartDatum } from '../utils/types';

type MigrationPlansDonutCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
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
            labels={({ datum }: { datum: ChartDatum }) =>
              count.Total === 0
                ? (undefined as unknown as string)
                : `${t('{{count}} plan', { count: datum.y })}
            ${datum.x}`
            }
            title={`${count?.Total ?? '0'}`}
            subTitle={t('Plans')}
            innerRadius={88}
            events={[
              {
                eventHandlers: {
                  onClick: (_, props: { index: number }) => {
                    // Get the phase from the clicked slice
                    const phase = data[props.index]?.phase;
                    // Build the URL with the phase param as a JSON array
                    const params = new URLSearchParams({
                      phase: JSON.stringify([phase]),
                    });
                    navigate(`${plansListURL}?${params.toString()}`);
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
        <div>
          <Link to={plansListURL}>{t('View all plans')}</Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default MigrationPlansDonutCard;
