import type { FC } from 'react';
import { useCreateOverviewContext } from 'src/modules/Overview/hooks/OverviewContextProvider';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';

import ConditionsCard from './cards/ConditionsCard';
import ControllerCard from './cards/ControllerCard';
import OperatorCard from './cards/OperatorCard';
import SettingsCard from './cards/SettingsCard';
import OverviewCard from './cards/WelcomeCard';

type ForkliftControllerDetailsTabProps = {
  obj: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ForkliftControllerDetailsTab: FC<ForkliftControllerDetailsTabProps> = ({ obj }) => {
  // Set and use context data for the overview page state
  const { setData } = useCreateOverviewContext();
  const { data: { hideWelcomeCardByContext } = {} } = useCreateOverviewContext();

  return (
    <div className="co-dashboard-body">
      <Flex direction={{ default: 'column' }}>
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

        <FlexItem>
          <OperatorCard obj={obj} />
        </FlexItem>

        <FlexItem>
          <Flex direction={{ default: 'row' }}>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Stack hasGutter>
                <StackItem>
                  <ControllerCard obj={obj} />
                </StackItem>

                <StackItem>
                  <ConditionsCard obj={obj} />
                </StackItem>
              </Stack>
            </FlexItem>

            <FlexItem>
              <Stack hasGutter>
                <StackItem>
                  <SettingsCard obj={obj} />
                </StackItem>
              </Stack>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </div>
  );
};

export default ForkliftControllerDetailsTab;
