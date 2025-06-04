import { type FC, useContext } from 'react';
import { CreateOverviewContext } from 'src/overview/hooks/OverviewContext';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  type V1beta1ForkliftController,
  type V1beta1Migration,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { getVmMigrationsDataPoints } from '../../utils/getVmMigrationsDataPoints';
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
  const [migrations] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  const vmMigrationsDataPoints = getVmMigrationsDataPoints(migrations, selectedRange);

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
      <CardBody className="forklift-status-migration-chart">
        <VmMigrationsHistoryChart
          vmMigrationsDataPoints={vmMigrationsDataPoints}
          selectedTimeRange={selectedRange}
        />
      </CardBody>
    </Card>
  );
};

export default VmMigrationsHistoryCard;
