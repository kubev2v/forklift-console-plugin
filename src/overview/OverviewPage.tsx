import { type FC, useContext, useState } from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';
import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';
import ForkliftLearningExperience from 'src/onlineHelp/tipsAndTricksDrawer/components/ForkliftLearningExperience';
import { createLearningExperienceContext } from 'src/onlineHelp/tipsAndTricksDrawer/hooks/learningExperienceContext';
import {
  loadLearningExperienceContext,
  saveLearningExperienceContext,
} from 'src/onlineHelp/tipsAndTricksDrawer/utils/forkliftLearningExperienceUserSettings';
import {
  indexToTopic,
  topicToIndex,
} from 'src/onlineHelp/tipsAndTricksDrawer/utils/topicToIndexConvertors';

import RoutedTabs from '@components/common/RoutedTabs/RoutedTabs';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getOverviewPath } from '@utils/helpers/getOverviewPath';

import HeaderTitle from './components/HeaderTitle';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerHistoryTab from './tabs/History/ForkliftControllerHistoryTab';
import ForkliftControllerOverviewTab from './tabs/Overview/ForkliftControllerOverviewTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';
import { OverviewTabHref, OverviewTabName } from './constants';

import './OverviewPage.scss';

const OverviewPage: FC = () => {
  const { trackEvent } = useForkliftAnalytics();
  const { setUserData, userData: { showLearningPanelByContext } = {} } = useContext(
    createLearningExperienceContext,
  );

  const [panelSelectedTopic, setPanelSelectedTopic] = useState<LearningExperienceTopic | undefined>(
    indexToTopic(loadLearningExperienceContext()?.learningExperienceContext),
  );

  const setIsDrawerOpen = (isOpen: boolean) => {
    setUserData({ showLearningPanelByContext: isOpen });
  };

  const setSelectedTopic = (topic?: LearningExperienceTopic) => {
    saveLearningExperienceContext(topicToIndex(topic));
    setPanelSelectedTopic(topic);
  };

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
    <Drawer isInline isExpanded={showLearningPanelByContext} position="right">
      <DrawerContent
        panelContent={
          <ForkliftLearningExperience
            setIsDrawerOpen={setIsDrawerOpen}
            setSelectedTopic={setSelectedTopic}
            selectedTopic={panelSelectedTopic}
          />
        }
      >
        <DrawerContentBody>
          <HeaderTitle
            isDrawerOpen={showLearningPanelByContext}
            setIsDrawerOpen={setIsDrawerOpen}
          />
          <RoutedTabs tabs={tabs} />
          <div className="pf-v6-u-h-100 pf-v6-u-display-flex pf-v6-u-flex-direction-column pf-v6-u-p-md">
            <Routes>
              <Route index element={<ForkliftControllerOverviewTab />} />
              <Route path={OverviewTabHref.YAML} element={<ForkliftControllerYAMLTab />} />
              <Route path={OverviewTabHref.Health} element={<ForkliftControllerHealthTab />} />
              <Route path={OverviewTabHref.History} element={<ForkliftControllerHistoryTab />} />
              <Route path={OverviewTabHref.Settings} element={<ForkliftControllerSettingsTab />} />
            </Routes>
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default OverviewPage;
