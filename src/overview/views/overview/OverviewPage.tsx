import type { FC } from 'react';
import InventoryNotReachable from 'src/modules/Providers/views/list/components/InventoryNotReachable';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { useK8sWatchForkliftController } from '../../hooks/useK8sWatchProviderNames';
import { useProvidersInventoryIsLive } from '../../hooks/useProvidersInventoryIsLive';
import { getOperatorPhase } from '../../utils/helpers/getOperatorPhase';

import HeaderTitle from './components/HeaderTitle';
import OperatorStatus from './components/OperatorStatus';
import { ShowWelcomeCardButton } from './components/ShowWelcomeCardButton';
import ForkliftControllerDetailsTab from './tabs/Details/ForkliftControllerDetailsTab';
import ForkliftControllerHealthTab from './tabs/Health/ForkliftControllerHealthTab';
import ForkliftControllerSettingsTab from './tabs/Settings/ForkliftControllerSettingsTab';
import ForkliftControllerYAMLTab from './tabs/YAML/ForkliftControllerYAMLTab';

import './OverviewPage.style.css';

const OverviewPage: FC<OverviewPageProps> = () => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      component: ForkliftControllerDetailsTabWrapper,
      href: '',
      name: t('Overview'),
    },
    {
      component: ForkliftControllerYAMLTabWrapper,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: ForkliftControllerHealthTabWrapper,
      href: 'health',
      name: t('Health'),
    },
    {
      component: ForkliftControllerSettingsTabWrapper,
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

type OverviewPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

const HeaderTitleWrapper: FC = () => {
  const [forkliftController] = useK8sWatchForkliftController();
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});

  const { t } = useForkliftTranslation();

  const phaseObj = getOperatorPhase(forkliftController);

  return (
    <>
      <HeaderTitle
        title={t('Migration Toolkit for Virtualization')}
        // status={<OperatorStatus status={phaseObj.phase} />}
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

const ForkliftControllerDetailsTabWrapper: FC = () => {
  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();

  return (
    <ForkliftControllerDetailsTab obj={forkliftController} loaded={loaded} loadError={loadError} />
  );
};

const ForkliftControllerYAMLTabWrapper: FC = () => {
  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();

  return (
    <ForkliftControllerYAMLTab obj={forkliftController} loaded={loaded} loadError={loadError} />
  );
};

const ForkliftControllerHealthTabWrapper: FC = () => {
  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();

  return (
    <ForkliftControllerHealthTab obj={forkliftController} loaded={loaded} loadError={loadError} />
  );
};

const ForkliftControllerSettingsTabWrapper: FC = () => {
  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();

  return (
    <ForkliftControllerSettingsTab obj={forkliftController} loaded={loaded} loadError={loadError} />
  );
}

export default OverviewPage;
