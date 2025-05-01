/* eslint-disable camelcase */
import { type FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import useMigrationCounts from 'src/modules/Overview/hooks/useMigrationCounts';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef, type V1beta1ForkliftController } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import {
  global_danger_color_100,
  global_info_color_100,
  global_success_color_100,
} from '@patternfly/react-tokens';

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
        <div style={{ height: '230px', width: '230px' }}>
          <ChartDonut
            ariaDesc="Donut chart with migration plans statistics"
            ariaTitle="Migration plans"
            colorScale={[
              global_info_color_100.value, // Blue for "Running"
              global_danger_color_100.value, // Red for "Failed"
              global_success_color_100.value, // Green for "Succeeded"
            ]}
            constrainToVisibleArea
            data={[
              { x: t('Running'), y: count.Running },
              { x: t('Failed'), y: count.Failed },
              { x: t('Succeeded'), y: count.Succeeded },
            ]}
            labels={({ datum }) => `${datum.x}: ${datum.y}`}
            title={`${count.Total}`}
            subTitle="Plans"
            // legendData={[{ name: t('Running') }, { name: t('Failed') }, { name: t('Succeeded') }]}
            // legendOrientation="vertical"
            // legendPosition="right"
            // height={200}
            // width={600}
            // padding={{
            //   bottom: 100,
            //   left: 50,
            //   right: 200, // Adjust for legend space
            //   top: 50,
            // }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to={plansListURL}>{t('View all plans')}</Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default MigrationPlansDonutCard;
