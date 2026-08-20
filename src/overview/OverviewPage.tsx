import type { FC } from 'react';
import { Route, Routes } from 'react-router';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import InventoryNotReachable from 'src/providers/list/components/InventoryNotReachable';

import LightspeedMcpWarning from '@components/common/LightspeedMcpWarning/LightspeedMcpWarning';
import RoutedTabs from '@components/common/RoutedTabs/RoutedTabs';
import { PageSection, Split, SplitItem, Title } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getOverviewPath } from '@utils/helpers/getOverviewPath';
import { useLightspeedMcpStatus } from '@utils/hooks/useLightspeedMcpStatus/useLightspeedMcpStatus';
import { useForkliftTranslation } from '@utils/i18n';
import { OverviewTabHref } from '@utils/paths/overview';

import { useProvidersInventoryIsLive } from './hooks/useProvidersInventoryIsLive';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerHistoryTab from './tabs/History/ForkliftControllerHistoryTab';
import ForkliftControllerOverviewTab from './tabs/Overview/ForkliftControllerOverviewTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';
import { OverviewTabName } from './constants';

import './OverviewPage.scss';

const OverviewPage: FC = () => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});
  const { showMcpWarning } = useLightspeedMcpStatus();

  const tabs = [
    {
      name: OverviewTabName.Overview,
      onClick: (): void => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.Overview });
      },
      to: getOverviewPath(),
    },
    {
      name: OverviewTabName.YAML,
      onClick: (): void => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.YAML });
      },
      to: getOverviewPath(OverviewTabHref.YAML),
    },
    {
      name: OverviewTabName.Health,
      onClick: (): void => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.Health });
      },
      to: getOverviewPath(OverviewTabHref.Health),
    },
    {
      name: OverviewTabName.History,
      onClick: (): void => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.History });
      },
      to: getOverviewPath(OverviewTabHref.History),
    },
    {
      name: OverviewTabName.Settings,
      onClick: (): void => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.Settings });
      },
      to: getOverviewPath(OverviewTabHref.Settings),
    },
  ];

  return (
    <LearningExperienceDrawer>
      <div className="forklift-details-page-layout">
        <PageSection hasBodyWrapper={false}>
          <Split hasGutter style={{ alignItems: 'baseline' }}>
            <SplitItem isFilled>
              <Title headingLevel="h1">{t('Migration Toolkit for Virtualization')}</Title>
            </SplitItem>
            <SplitItem>
              <LearningExperienceButton />
            </SplitItem>
          </Split>
        </PageSection>

        {inventoryLivelinessError && (
          <PageSection hasBodyWrapper={false}>
            {[<InventoryNotReachable key="inventoryNotReachable" />]}
          </PageSection>
        )}

        {showMcpWarning && (
          <PageSection hasBodyWrapper={false}>
            <LightspeedMcpWarning />
          </PageSection>
        )}
        <RoutedTabs tabs={tabs} />
        <div className="forklift-details-page-layout__content pf-v6-u-p-md">
          <Routes>
            <Route element={<ForkliftControllerOverviewTab />} index />
            <Route element={<ForkliftControllerYAMLTab />} path={OverviewTabHref.YAML} />
            <Route element={<ForkliftControllerHealthTab />} path={OverviewTabHref.Health} />
            <Route element={<ForkliftControllerHistoryTab />} path={OverviewTabHref.History} />
            <Route element={<ForkliftControllerSettingsTab />} path={OverviewTabHref.Settings} />
          </Routes>
        </div>
      </div>
    </LearningExperienceDrawer>
  );
};

export default OverviewPage;
