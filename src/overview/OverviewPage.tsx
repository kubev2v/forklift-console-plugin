import type { FC } from 'react';
import InventoryNotReachable from 'src/modules/Providers/views/list/components/InventoryNotReachable';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import HeaderTitle from './components/HeaderTitle';
import { ShowWelcomeCardButton } from './components/ShowWelcomeCardButton';
import { useProvidersInventoryIsLive } from './hooks/useProvidersInventoryIsLive';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerHistoryTab from './tabs/History/ForkliftControllerHistoryTab';
import ForkliftControllerOverviewTab from './tabs/Overview/ForkliftControllerOverviewTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';

import './OverviewPage.scss';

const HeaderTitleWrapper: FC = () => {
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});

  const { t } = useForkliftTranslation();

  return (
    <>
      <HeaderTitle
        title={t('Migration Toolkit for Virtualization')}
        badge={<ShowWelcomeCardButton />}
      />
      {inventoryLivelinessError && (
        <PageSection variant="light">
          {[<InventoryNotReachable key={'inventoryNotReachable'} />]}
        </PageSection>
      )}
    </>
  );
};

const OverviewPage: FC = () => {
  const { t } = useForkliftTranslation();

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
    <>
      <HeaderTitleWrapper />
      <div className="pf-v5-u-h-100 pf-v5-u-display-flex pf-v5-u-flex-direction-column pf-v5-u-min-width-0 pf-v5-u-min-height-0">
        <HorizontalNav pages={pages.filter(Boolean)} />
      </div>
    </>
  );
};

export default OverviewPage;
