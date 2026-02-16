import { type FC, memo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderCredentialsTabPage from './tabs/Credentials/ProviderCredentialsTabPage';
import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderNetworksTabPage from './tabs/Networks/ProviderNetworksTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';
import type { ProviderDetailsPageProps } from './utils/types';
import ProviderPageHeader from './ProviderPageHeader';

const OpenshiftProviderDetailsPage: FC<ProviderDetailsPageProps> = memo(({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const tabPages: NavPage[] = [
    {
      component: () => <ProviderDetailsTabPage name={name} namespace={namespace} />,
      href: '',
      name: t('Details'),
    },
    {
      component: () => <ProviderYAMLTabPage name={name} namespace={namespace} />,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: () => <ProviderCredentialsTabPage name={name} namespace={namespace} />,
      href: 'credentials',
      name: t('Credentials'),
    },
    {
      component: () => <ProviderVirtualMachinesTabPage name={name} namespace={namespace} />,
      href: 'vms',
      name: t('Virtual machines'),
    },
    {
      component: () => <ProviderNetworksTabPage name={name} namespace={namespace} />,
      href: 'networks',
      name: t('Networks'),
    },
  ];

  return (
    <>
      <div className="forklift-details-page-layout">
        <ProviderPageHeader name={name} namespace={namespace} />
        <div className="forklift-details-page-layout__content">
          <HorizontalNav pages={tabPages} />
        </div>
      </div>
    </>
  );
});

export default OpenshiftProviderDetailsPage;
