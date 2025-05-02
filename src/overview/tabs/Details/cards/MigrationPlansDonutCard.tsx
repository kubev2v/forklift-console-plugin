import { type FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import useMigrationCounts from 'src/overview/hooks/useMigrationCounts';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef, type V1beta1ForkliftController } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import { ChartColors } from '../utils/colors';
import type { ChartDatum } from '../utils/types';

type MigrationPlansDonutCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

const MigrationPlansDonutCard: FC<MigrationPlansDonutCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { count } = useMigrationCounts();
  const [activeNamespace] = useActiveNamespace();

  const plansListURL = useMemo(() => {
    return getResourceUrl({
      namespace: activeNamespace,
      namespaced: true,
      reference: PlanModelRef,
    });
  }, [activeNamespace]);

  return (
    <Card>
      <CardTitle className="forklift-title">{t('Migration plans')}</CardTitle>
      <CardBody className="forklift-status-migration">
        <div className="forklift-status-migration-donut">
          <ChartDonut
            ariaDesc={t('Donut chart with migration plans statistics')}
            ariaTitle={t('Migration plans')}
            colorScale={[
              ChartColors.Running,
              ChartColors.Failure,
              ChartColors.Success,
              ChartColors.Canceled,
            ]}
            constrainToVisibleArea
            data={
              [
                { x: t('Running'), y: count.Running },
                { x: t('Failed'), y: count.Failed },
                { x: t('Succeeded'), y: count.Succeeded },
                { x: t('Canceled'), y: count.Canceled },
              ] as ChartDatum[]
            }
            labels={({ datum }: { datum: ChartDatum }) => `${datum.x}: ${datum.y}`}
            title={`${count.Total}`}
            subTitle={t('Plans')}
          />
        </div>
        <div className="pf-v5-u-text-align-center">
          <Link to={plansListURL}>{t('View all plans')}</Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default MigrationPlansDonutCard;
