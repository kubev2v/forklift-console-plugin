import { type FC, useContext } from 'react';
import { CreateOverviewContext } from 'src/overview/hooks/OverviewContext';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import type { V1beta1ForkliftController } from '@kubev2v/types';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { useVmMigrationsDataPoints } from '../../hooks/useVmMigrationsDataPoints';
import { TimeRangeOptions } from '../../utils/timeRangeOptions';
import HeaderActions from '../CardHeaderActions';

import VmMigrationsHistoryChart from './VmMigrationsHistoryChart';

type MigrationsCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

const VmMigrationsHistoryCard: FC<MigrationsCardProps> = () => {
  const { t } = useForkliftTranslation();
  const { data, setData } = useContext(CreateOverviewContext);
  const selectedRange = data?.vmMigrationsHistorySelectedRange ?? TimeRangeOptions.Last10Days;
  const setSelectedRange = (range: TimeRangeOptions) => {
    setData({
      ...data,
      vmMigrationsHistorySelectedRange: range,
    });
  };
  const { failed, loaded, loadError, obj, running, succeeded } =
    useVmMigrationsDataPoints(selectedRange);

  return (
    <Card className="pf-m-full-height">
      <CardHeader
        actions={{
          actions: (
            <HeaderActions
              selectedTimeRange={selectedRange}
              setSelectedTimeRange={setSelectedRange}
            />
          ),
        }}
      >
        <CardTitle className="forklift-title">{t('Migration history')}</CardTitle>
      </CardHeader>
      <CardBody className="forklift-overview__status-migration-chart">
        <LoadingSuspend obj={obj} loaded={loaded} loadError={loadError}>
          <VmMigrationsHistoryChart
            selectedRange={selectedRange}
            vmMigrationsDataPoints={{
              failed,
              running,
              succeeded,
            }}
          />
        </LoadingSuspend>
      </CardBody>
    </Card>
  );
};

export default VmMigrationsHistoryCard;
