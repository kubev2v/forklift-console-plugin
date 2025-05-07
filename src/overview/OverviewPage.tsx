import type { FC } from 'react';
import InventoryNotReachable from 'src/modules/Providers/views/list/components/InventoryNotReachable';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import HeaderTitle from './components/HeaderTitle';
import { ShowWelcomeCardButton } from './components/ShowWelcomeCardButton';
import { useProvidersInventoryIsLive } from './hooks/useProvidersInventoryIsLive';
import ForkliftControllerDetailsTab from './tabs/Details/ForkliftControllerDetailsTab';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';

import './OverviewPage.scss';

type OverviewPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

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

const OverviewPage: FC<OverviewPageProps> = () => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      component: ForkliftControllerDetailsTab,
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
      component: ForkliftControllerSettingsTab,
      href: 'settings',
      name: t('Settings'),
    },
  ];

  return (
    <>
      <HeaderTitleWrapper />
      <HorizontalNav pages={pages.filter(Boolean)} />
    </>
  );
};
OverviewPage.displayName = 'OverviewPage';

export default OverviewPage;
