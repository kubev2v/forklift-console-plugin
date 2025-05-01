import type { FC } from 'react';
import useMigrationCounts from 'src/modules/Overview/hooks/useMigrationCounts';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import { ChartColors } from '../utils/colors';

type VmMigrationsDonutCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

const VmMigrationsDonutCard: FC<VmMigrationsDonutCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { vmCount } = useMigrationCounts();

  return (
    <Card className="pf-m-full-height">
      <CardTitle className="forklift-title">{t('Virtual Machines')}</CardTitle>
      <CardBody className="forklift-status-migration">
        <div style={{ height: '230px', width: '230px' }}>
          <ChartDonut
            ariaDesc="Donut chart with VM migration statistics"
            ariaTitle="Virtual Machine Migrations"
            colorScale={[
              ChartColors.Running,
              ChartColors.Failure,
              ChartColors.Success,
              ChartColors.Canceled,
            ]}
            constrainToVisibleArea
            data={[
              { x: t('Running'), y: vmCount.Running },
              { x: t('Failed'), y: vmCount.Failed },
              { x: t('Succeeded'), y: vmCount.Succeeded },
              { x: t('Canceled'), y: vmCount.Canceled },
            ]}
            labels={({ datum }) => `${datum.x}: ${datum.y}`}
            title={`${vmCount.Total}`}
            subTitle="Migrated"
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
      </CardBody>
    </Card>
  );
};

export default VmMigrationsDonutCard;
