import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import { ChartsCard } from './cards/ChartsCard';
import { ConditionsCard, MigrationsCard, OperatorCard, OverviewCard, SettingsCard } from './cards';

interface ForkliftControllerDetailsTabProps extends RouteComponentProps {
  obj: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ForkliftControllerDetailsTab: React.FC<ForkliftControllerDetailsTabProps> = ({
  obj,
}) => {
  return (
    <div className="co-dashboard-body">
      <Flex>
        <Flex direction={{ default: 'column' }} flex={{ default: 'flex_4' }}>
          <FlexItem>
            <OverviewCard obj={obj} />
          </FlexItem>

          <FlexItem>
            <MigrationsCard obj={obj} />
          </FlexItem>

          <FlexItem>
            <OperatorCard obj={obj} />
          </FlexItem>

          <FlexItem>
            <ConditionsCard obj={obj} />
          </FlexItem>
        </Flex>

        <Flex direction={{ default: 'column' }} alignSelf={{ default: 'alignSelfFlexStart' }}>
          <FlexItem>
            <SettingsCard obj={obj} />
          </FlexItem>

          <FlexItem>
            <ChartsCard obj={obj} />
          </FlexItem>
        </Flex>
      </Flex>
    </div>
  );
};

export default ForkliftControllerDetailsTab;
