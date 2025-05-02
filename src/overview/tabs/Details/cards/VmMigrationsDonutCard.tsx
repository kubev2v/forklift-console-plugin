import type { FC } from 'react';
import useMigrationCounts from 'src/overview/hooks/useMigrationCounts';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import { ChartColors } from '../utils/colors';
import type { ChartDatum } from '../utils/types';

type VmMigrationsDonutCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

const VmMigrationsDonutCard: FC<VmMigrationsDonutCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { vmCount } = useMigrationCounts();

  return (
    <Card>
      <CardTitle className="forklift-title">{t('Virtual Machines')}</CardTitle>
      <CardBody className="forklift-status-migration">
        <div className="forklift-status-migration-donut">
          <ChartDonut
            ariaDesc={t('Donut chart with VM migration statistics')}
            ariaTitle={t('Virtual Machine Migrations')}
            colorScale={[
              ChartColors.Running,
              ChartColors.Failure,
              ChartColors.Success,
              ChartColors.Canceled,
            ]}
            constrainToVisibleArea
            data={
              [
                { x: t('Running'), y: vmCount.Running },
                { x: t('Failed'), y: vmCount.Failed },
                { x: t('Succeeded'), y: vmCount.Succeeded },
                { x: t('Canceled'), y: vmCount.Canceled },
              ] as ChartDatum[]
            }
            labels={({ datum }: { datum: ChartDatum }) => `${datum.x}: ${datum.y}`}
            title={`${vmCount.Total}`}
            subTitle={t('Migrated')}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default VmMigrationsDonutCard;
