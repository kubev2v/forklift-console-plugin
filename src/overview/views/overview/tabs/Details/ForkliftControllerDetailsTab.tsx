import type { FC } from 'react';
import { useCreateOverviewContext } from 'src/modules/Overview/hooks/OverviewContextProvider';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import ControllerCard from '../Health/cards/ControllerCard';

import MigrationPlansDonutCard from './cards/MigrationPlansDonutCard';
import VmMigrationsDonutCard from './cards/VmMigrationsDonutCard';
import VmMigrationsHistoryCard from './cards/VmMigrationsHistoryCard';
import WelcomeCard from './cards/WelcomeCard';

import '@patternfly/patternfly/patternfly-charts-theme-dark.css';

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
        {hideWelcomeCardByContext ? null : (
          <FlexItem>
            <WelcomeCard
              obj={obj}
              onHide={() => {
                setData({ hideWelcomeCardByContext: true });
              }}
            />
          </FlexItem>
        )}

        <FlexItem>
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsStretch' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <VmMigrationsDonutCard obj={obj} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} style={{ height: '318px' }}>
              <VmMigrationsHistoryCard obj={obj} />
            </FlexItem>
          </Flex>
        </FlexItem>

        <FlexItem>
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsStretch' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <MigrationPlansDonutCard obj={obj} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} style={{ height: '339px', overflow: 'auto' }}>
              <ControllerCard obj={obj} limit={5} />
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </div>
  );
};

export default ForkliftControllerDetailsTab;
