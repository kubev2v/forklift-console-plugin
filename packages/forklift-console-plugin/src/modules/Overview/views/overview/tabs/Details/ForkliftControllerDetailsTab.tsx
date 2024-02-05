import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useCreateOverviewContext } from 'src/modules/Overview/hooks/OverviewContextProvider';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import { ConditionsCard, OperatorCard, OverviewCard, SettingsCard } from './cards';

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
  // Set and use context data for the overview page state
  const { setData } = useCreateOverviewContext();
  const { data: { hideWelcomeCardByContext } = {} } = useCreateOverviewContext();

  return (
    <div className="co-dashboard-body">
      <Flex direction={{ default: 'column' }}>
        <Flex>
          {!hideWelcomeCardByContext ? (
            <FlexItem>
              <OverviewCard
                obj={obj}
                onHide={() => {
                  setData({ hideWelcomeCardByContext: true });
                }}
              />
            </FlexItem>
          ) : null}
        </Flex>
        <Flex
          direction={{ default: 'column' }}
          flex={{ default: 'flex_1' }}
          alignItems={{ default: 'alignItemsStretch' }}
          alignContent={{ default: 'alignContentStretch' }}
        >
          <FlexItem>
            <OperatorCard obj={obj} />
          </FlexItem>
        </Flex>
        <Flex>
          <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
            <ConditionsCard obj={obj} />
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <SettingsCard obj={obj} />
          </FlexItem>
        </Flex>
      </Flex>
    </div>
  );
};

export default ForkliftControllerDetailsTab;
