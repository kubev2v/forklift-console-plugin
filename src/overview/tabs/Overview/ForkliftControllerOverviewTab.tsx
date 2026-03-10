import type { FC } from 'react';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchForkliftController';

import { Flex, FlexItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import ControllerCard from '../Health/cards/Controller/ControllerCard';

import MigrationPlansDonutCard from './cards/MigrationPlansDonutCard';
import ThroughputCard from './cards/throughput/ThroughputCard';
import VmMigrationsDonutCard from './cards/VmMigrationsDonutCard';
import VmMigrationsHistoryCard from './cards/VmMigrationsHistory/VmMigrationsHistoryCard';
import WelcomeCard from './cards/Welcome/WelcomeCard';

import '@patternfly/patternfly/patternfly-charts.css';

const NET_THROUGHPUT_METRIC = 'mtv_migration_net_throughput';
const STORAGE_THROUGHPUT_METRIC = 'mtv_migration_storage_throughput';

const ForkliftControllerOverviewTab: FC = () => {
  const [forkliftController] = useK8sWatchForkliftController();
  const { t } = useForkliftTranslation();

  return (
    <div className="co-dashboard-body">
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
        <FlexItem>
          <WelcomeCard />
        </FlexItem>
        <FlexItem>
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsStretch' }}
            spaceItems={{ default: 'spaceItemsMd' }}
          >
            <FlexItem className="forklift-overview__donut-card">
              <VmMigrationsDonutCard obj={forkliftController} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} className="forklift-overview__vms">
              <VmMigrationsHistoryCard obj={forkliftController} />
            </FlexItem>
          </Flex>
        </FlexItem>

        <FlexItem>
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsStretch' }}
            spaceItems={{ default: 'spaceItemsMd' }}
          >
            <FlexItem className="forklift-overview__donut-card">
              <MigrationPlansDonutCard obj={forkliftController} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} className="forklift-overview__pods">
              <ControllerCard obj={forkliftController} limit={6} />
            </FlexItem>
          </Flex>
        </FlexItem>

        <FlexItem>
          <Flex
            direction={{ default: 'column', lg: 'row' }}
            alignItems={{ default: 'alignItemsStretch' }}
            spaceItems={{ default: 'spaceItemsMd' }}
          >
            <FlexItem flex={{ default: 'flex_1' }} className="forklift-overview__throughput-card">
              <ThroughputCard metricName={NET_THROUGHPUT_METRIC} title={t('Network throughput')} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} className="forklift-overview__throughput-card">
              <ThroughputCard
                metricName={STORAGE_THROUGHPUT_METRIC}
                title={t('Storage throughput')}
              />
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    </div>
  );
};

export default ForkliftControllerOverviewTab;
