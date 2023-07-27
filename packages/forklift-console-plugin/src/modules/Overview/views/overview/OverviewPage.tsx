import React from 'react';
import { InventoryNotReachable } from 'src/modules/Providers/views/list/components';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { useK8sWatchForkliftController, useProvidersInventoryIsLive } from '../../hooks';
import { getOperatorPhase } from '../../utils/helpers/getOperatorPhase';

import OperatorStatus from './components/OperatorStatus';
import { HeaderTitle } from './components';
import { ForkliftControllerDetailsTab, ForkliftControllerYAMLTab } from './tabs';

import './OverviewPage.style.css';

export const OverviewPage: React.FC<OverviewPageProps> = () => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      href: '',
      name: t('Overview'),
      component: ForkliftControllerDetailsTabWrapper,
    },
    {
      href: 'yaml',
      name: t('YAML'),
      component: ForkliftControllerYAMLTabWrapper,
    },
  ];

  return (
    <>
      <HeaderTitleWrapper />
      <HorizontalNav pages={pages.filter((p) => p)} />
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

const HeaderTitleWrapper: React.FC = () => {
  const [forkliftController] = useK8sWatchForkliftController();
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});

  const { t } = useForkliftTranslation();

  const phaseObj = getOperatorPhase(forkliftController);

  return (
    <>
      <HeaderTitle
        title={t('Migration Toolkit for Virtualization')}
        status={<OperatorStatus status={phaseObj.phase} />}
      />
      {inventoryLivelinessError && (
        <PageSection>{[<InventoryNotReachable key={'inventoryNotReachable'} />]}</PageSection>
      )}
    </>
  );
};

const ForkliftControllerDetailsTabWrapper: React.FC = () => {
  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();

  return (
    <ForkliftControllerDetailsTab obj={forkliftController} loaded={loaded} loadError={loadError} />
  );
};

const ForkliftControllerYAMLTabWrapper: React.FC = () => {
  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();

  return (
    <ForkliftControllerYAMLTab obj={forkliftController} loaded={loaded} loadError={loadError} />
  );
};

export default OverviewPage;
