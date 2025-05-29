import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { ProviderPageHeadings } from 'src/modules/Providers/views/details/components/ProviderPageHeadings';
import { ProviderCredentialsTabPage } from 'src/modules/Providers/views/details/tabs/Credentials/ProviderCredentials';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderNetworksTabPage from './tabs/Networks/ProviderNetworksTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';

const OpenshiftProviderDetailsPage: FC<{
  name: string;
  namespace: string;
  provider: V1beta1Provider;
}> = ({ name, namespace, provider }) => {
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
      component: () => <ProviderCredentialsTabPage name={name} namespace={namespace} />,
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
      <ProviderPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={tabPages} />
    </ModalHOC>
  );
};

export default OpenshiftProviderDetailsPage;
