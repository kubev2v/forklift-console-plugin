import React from 'react';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import { MigrationsCard, MigrationsChartCard, VmMigrationsChartCard } from './cards';

type ForkliftControllerMetricsTabProps = {
  obj: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

export const ForkliftControllerMetricsTab: React.FC<ForkliftControllerMetricsTabProps> = ({
  obj,
}) => {
  return (
    <div className="co-dashboard-body">
      <Flex>
        <Flex
          direction={{ default: 'column' }}
          flex={{ default: 'flex_1' }}
          alignItems={{ default: 'alignItemsStretch' }}
          alignContent={{ default: 'alignContentStretch' }}
        >
          <FlexItem>
            <MigrationsCard obj={obj} />
          </FlexItem>
          <FlexItem fullWidth={{ default: 'fullWidth' }}>
            <MigrationsChartCard obj={obj} />
          </FlexItem>
          <FlexItem fullWidth={{ default: 'fullWidth' }}>
            <VmMigrationsChartCard obj={obj} />
          </FlexItem>
        </Flex>
      </Flex>
    </div>
  );
};

export default ForkliftControllerMetricsTab;
