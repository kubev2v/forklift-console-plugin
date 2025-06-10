import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderCredentialsTabPage from './tabs/Credentials/ProviderCredentialsTabPage';
import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderNetworksTabPage from './tabs/Networks/ProviderNetworksTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';
import ProviderPageHeader from './ProviderPageHeader';

const OpenshiftProviderDetailsPage: FC<{
  provider: V1beta1Provider;
}> = ({ provider }) => {
  const { t } = useForkliftTranslation();

  const tabPages: NavPage[] = [
    {
      component: () => <ProviderDetailsTabPage provider={provider} />,
      href: '',
      name: t('Details'),
    },
    {
      component: () => <ProviderYAMLTabPage provider={provider} />,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: () => <ProviderCredentialsTabPage provider={provider} />,
      href: 'credentials',
      name: t('Credentials'),
    },
    {
      component: () => <ProviderVirtualMachinesTabPage provider={provider} />,
      href: 'vms',
      name: t('Virtual machines'),
    },
    {
      component: () => <ProviderNetworksTabPage provider={provider} />,
      href: 'networks',
      name: t('Networks'),
    },
  ];

  return (
    <ModalHOC>
      <ProviderPageHeader provider={provider} />
      <HorizontalNav pages={tabPages} />
    </ModalHOC>
  );
};

export default OpenshiftProviderDetailsPage;
