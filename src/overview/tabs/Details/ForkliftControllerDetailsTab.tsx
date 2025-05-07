import type { FC } from 'react';
import { useCreateOverviewContext } from 'src/overview/hooks/OverviewContextProvider';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchProviderNames';

import { Flex, FlexItem } from '@patternfly/react-core';

import ControllerCard from '../Health/cards/ControllerCard';

import MigrationPlansDonutCard from './cards/MigrationPlansDonutCard';
import VmMigrationsDonutCard from './cards/VmMigrationsDonutCard';
import VmMigrationsHistoryCard from './cards/VmMigrationsHistoryCard';
import WelcomeCard from './cards/WelcomeCard';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

const ForkliftControllerDetailsTab: FC = () => {
  const [forkliftController] = useK8sWatchForkliftController();
  // Set and use context data for the overview page state
  const { setData } = useCreateOverviewContext();
  const { data: { hideWelcomeCardByContext } = {} } = useCreateOverviewContext();

  return (
    <div className="co-dashboard-body">
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        {hideWelcomeCardByContext ? null : (
          <FlexItem>
            <WelcomeCard
              onHide={() => {
                setData({ hideWelcomeCardByContext: true });
              }}
            />
          </FlexItem>
        )}

        <FlexItem>
          <Flex direction={{ default: 'row' }}>
            <FlexItem>
              <VmMigrationsDonutCard obj={forkliftController} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} className="forklift-overview__vms">
              <VmMigrationsHistoryCard obj={forkliftController} />
            </FlexItem>
          </Flex>
        </FlexItem>

        <FlexItem>
          <Flex direction={{ default: 'row' }}>
            <FlexItem>
              <MigrationPlansDonutCard obj={forkliftController} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} className="forklift-overview__pods">
              <ControllerCard obj={forkliftController} limit={5} />
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </div>
  );
};

export default ForkliftControllerDetailsTab;
