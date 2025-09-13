import { type FC, useState } from 'react';
import ForkliftLearningExperience from 'src/onlineHelp/forkliftHelp/ForkliftLearningExperience';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import HeaderTitle from './components/HeaderTitle';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerHistoryTab from './tabs/History/ForkliftControllerHistoryTab';
import ForkliftControllerOverviewTab from './tabs/Overview/ForkliftControllerOverviewTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';

import './OverviewPage.scss';

const OverviewPage: FC = () => {
  const { t } = useForkliftTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const pages = [
    {
      component: ForkliftControllerOverviewTab,
      href: '',
      name: t('Overview'),
    },
    {
      component: ForkliftControllerYAMLTab,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: ForkliftControllerHealthTab,
      href: 'health',
      name: t('Health'),
    },
    {
      component: ForkliftControllerHistoryTab,
      href: 'history',
      name: t('History'),
    },
    {
      component: ForkliftControllerSettingsTab,
      href: 'settings',
      name: t('Settings'),
    },
  ];

  return (
    <Drawer isInline isExpanded={isDrawerOpen} position="right">
      <DrawerContent
        panelContent={<ForkliftLearningExperience setIsDrawerOpen={setIsDrawerOpen} />}
      >
        <DrawerContentBody>
          <HeaderTitle isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
          <div className="pf-v5-u-h-100 pf-v5-u-display-flex pf-v5-u-flex-direction-column pf-v5-u-min-width-0 pf-v5-u-min-height-0">
            <HorizontalNav pages={pages.filter(Boolean)} />
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default OverviewPage;
