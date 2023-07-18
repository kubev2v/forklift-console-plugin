import React from 'react';
import { InventoryNotReachable } from 'src/modules/Providers/views/list/components';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { useProvidersInventoryIsLive } from '../../hooks';
import { useK8sWatchForkliftController } from '../../hooks/useK8sWatchProviderNames';
import { getOperatorPhase } from '../../utils/helpers/getOperatorPhase';

import OperatorStatus from './components/OperatorStatus';
import { HeaderTitle } from './components';
import { ForkliftControllerDetailsTab, ForkliftControllerYAMLTab } from './tabs';

import './OverviewPage.style.css';

export const OverviewPage: React.FC<OverviewPageProps> = () => {
  const { t } = useForkliftTranslation();

  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});

  const phaseObj = getOperatorPhase(forkliftController);

  const pages = [
    {
      href: '',
      name: t('Overview'),
      component: () => {
        return (
          <ForkliftControllerDetailsTab
            obj={forkliftController}
            loaded={loaded}
            loadError={loadError}
          />
        );
      },
    },
    {
      href: 'yaml',
      name: t('YAML'),
      component: () => {
        return (
          <ForkliftControllerYAMLTab
            obj={forkliftController}
            loaded={loaded}
            loadError={loadError}
          />
        );
      },
    },
  ];

  return (
    <>
      <HeaderTitle
        title={t('Migration Toolkit for Virtualization')}
        status={<OperatorStatus status={phaseObj.phase} />}
      />

      {inventoryLivelinessError && <PageSection>{[InventoryNotReachable]}</PageSection>}

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

export default OverviewPage;
