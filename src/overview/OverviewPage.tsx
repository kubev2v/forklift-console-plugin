import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import InventoryNotReachable from 'src/providers/list/components/InventoryNotReachable';

import RoutedTabs from '@components/common/RoutedTabs/RoutedTabs';
import { PageSection, Split, SplitItem, Title } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getOverviewPath } from '@utils/helpers/getOverviewPath';
import { useForkliftTranslation } from '@utils/i18n';

import { useProvidersInventoryIsLive } from './hooks/useProvidersInventoryIsLive';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerHistoryTab from './tabs/History/ForkliftControllerHistoryTab';
import ForkliftControllerOverviewTab from './tabs/Overview/ForkliftControllerOverviewTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';
import { OverviewTabHref, OverviewTabName } from './constants';

import './OverviewPage.scss';

const OverviewPage: FC = () => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});

  const tabs = [
    {
      name: OverviewTabName.Overview,
      onClick: () => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.Overview });
      },
      to: getOverviewPath(),
    },
    {
      name: OverviewTabName.YAML,
      onClick: () => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.YAML });
      },
      to: getOverviewPath(OverviewTabHref.YAML),
    },
    {
      name: OverviewTabName.Health,
      onClick: () => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.Health });
      },
      to: getOverviewPath(OverviewTabHref.Health),
    },
    {
      name: OverviewTabName.History,
      onClick: () => {
        trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, { tabName: OverviewTabName.History });
      },
      to: getOverviewPath(OverviewTabHref.History),
    },
    {
      name: OverviewTabName.Settings,
      onClick: () => {
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
        <RoutedTabs tabs={tabs} />
        <div className="forklift-details-page-layout__content pf-v6-u-p-md">
          <Routes>
            <Route index element={<ForkliftControllerOverviewTab />} />
            <Route path={OverviewTabHref.YAML} element={<ForkliftControllerYAMLTab />} />
            <Route path={OverviewTabHref.Health} element={<ForkliftControllerHealthTab />} />
            <Route path={OverviewTabHref.History} element={<ForkliftControllerHistoryTab />} />
            <Route path={OverviewTabHref.Settings} element={<ForkliftControllerSettingsTab />} />
          </Routes>
        </div>
      </div>
    </LearningExperienceDrawer>
  );
};

export default OverviewPage;
