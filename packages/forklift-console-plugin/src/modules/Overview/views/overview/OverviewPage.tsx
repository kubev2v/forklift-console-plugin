import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Alert, PageSection, Text, TextContent, TextVariants } from '@patternfly/react-core';

import { useProvidersInventoryIsLive } from '../../hooks';
import { useK8sWatchForkliftController } from '../../hooks/useK8sWatchProviderNames';
import { getPhase } from '../../utils/helpers/getPhase';

import { HeaderTitle } from './components';
import { ForkliftControllerDetailsTab, ForkliftControllerYAMLTab } from './tabs';

import './OverviewPage.style.css';

export const OverviewPage: React.FC<OverviewPageProps> = () => {
  const { t } = useForkliftTranslation();

  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();
  const { loadError: inventoryLivelinessError } = useProvidersInventoryIsLive({});

  const phaseObj = getPhase(forkliftController);

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

  const inventoryNotReachable = (
    <Alert title={t('Inventory')} variant="warning">
      <TextContent>
        <Text component={TextVariants.p}>
          {t(
            'Inventory server is not reachable. To troubleshoot, check the Forklift controller pod logs.',
          )}
        </Text>
      </TextContent>
    </Alert>
  );

  return (
    <>
      <HeaderTitle
        title={t('Migration Toolkit for Virtualization')}
        status={<Status status={phaseObj.phase} />}
      />

      {inventoryLivelinessError && <PageSection>{[inventoryNotReachable]}</PageSection>}

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
