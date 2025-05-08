import { type FC, useContext } from 'react';
import { CreateOverviewContext } from 'src/overview/hooks/OverviewContext';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchProviderNames';

import { Flex, FlexItem } from '@patternfly/react-core';

import ControllerCard from '../Health/cards/Controller/ControllerCard';

import MigrationPlansDonutCard from './cards/MigrationPlansDonutCard';
import VmMigrationsDonutCard from './cards/VmMigrationsDonutCard';
import VmMigrationsHistoryCard from './cards/VmMigrationsHistory/VmMigrationsHistoryCard';
import WelcomeCard from './cards/Welcome/WelcomeCard';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

const ForkliftControllerOverviewTab: FC = () => {
  const [forkliftController] = useK8sWatchForkliftController();
  const { data: { hideWelcomeCardByContext } = {}, setData } = useContext(CreateOverviewContext);

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

export default ForkliftControllerOverviewTab;
