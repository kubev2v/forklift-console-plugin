import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import { ChartsCard, MigrationsCard } from './cards';

interface ForkliftControllerMetricsTabProps extends RouteComponentProps {
  obj: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

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
            <ChartsCard obj={obj} />
          </FlexItem>
        </Flex>
      </Flex>
    </div>
  );
};

export default ForkliftControllerMetricsTab;
