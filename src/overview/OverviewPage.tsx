import { type FC, useState } from 'react';
import ForkliftLearningExperience from 'src/onlineHelp/forkliftHelp/ForkliftLearningExperience';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { OverviewTab, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';

import HeaderTitle from './components/HeaderTitle';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerHistoryTab from './tabs/History/ForkliftControllerHistoryTab';
import ForkliftControllerOverviewTab from './tabs/Overview/ForkliftControllerOverviewTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';

import './OverviewPage.scss';

const OverviewPage: FC = () => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeTabName, setActiveTabName] = useState<OverviewTab>(OverviewTab.Overview);

  const isOverviewTab = (value: string): value is OverviewTab => {
    return Object.values(OverviewTab).includes(value as OverviewTab);
  };

  const handleTabSelect = (tabName: string) => {
    if (isOverviewTab(tabName)) {
      setActiveTabName(tabName);
      trackEvent(TELEMETRY_EVENTS.OVERVIEW_TAB_CLICKED, {
        tabName,
      });
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTabName) {
      case OverviewTab.Overview:
        return <ForkliftControllerOverviewTab />;
      case OverviewTab.YAML:
        return <ForkliftControllerYAMLTab />;
      case OverviewTab.Health:
        return <ForkliftControllerHealthTab />;
      case OverviewTab.History:
        return <ForkliftControllerHistoryTab />;
      case OverviewTab.Settings:
        return <ForkliftControllerSettingsTab />;
      default:
        return <ForkliftControllerOverviewTab />;
    }
  };

  return (
    <Drawer isInline isExpanded={isDrawerOpen} position="right">
      <DrawerContent
        panelContent={<ForkliftLearningExperience setIsDrawerOpen={setIsDrawerOpen} />}
      >
        <DrawerContentBody>
          <HeaderTitle isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
          <div className="pf-v5-u-h-100 pf-v5-u-display-flex pf-v5-u-flex-direction-column pf-v5-u-min-width-0 pf-v5-u-min-height-0">
            <Tabs
              activeKey={activeTabName}
              onSelect={(_, tabIndex) => {
                handleTabSelect(tabIndex as string);
              }}
            >
              <Tab
                eventKey={OverviewTab.Overview}
                title={<TabTitleText>{t('Overview')}</TabTitleText>}
              />
              <Tab eventKey={OverviewTab.YAML} title={<TabTitleText>{t('YAML')}</TabTitleText>} />
              <Tab
                eventKey={OverviewTab.Health}
                title={<TabTitleText>{t('Health')}</TabTitleText>}
              />
              <Tab
                eventKey={OverviewTab.History}
                title={<TabTitleText>{t('History')}</TabTitleText>}
              />
              <Tab
                eventKey={OverviewTab.Settings}
                title={<TabTitleText>{t('Settings')}</TabTitleText>}
              />
            </Tabs>
            {renderActiveTabContent()}
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default OverviewPage;
