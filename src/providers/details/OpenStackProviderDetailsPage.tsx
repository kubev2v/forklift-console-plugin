import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderCredentialsTabPage from './tabs/Credentials/ProviderCredentialsTabPage';
import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';
import ProviderPageHeader from './ProviderPageHeader';

const OpenStackProviderDetailsPage: FC<{
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
  ];

  return (
    <>
      <ProviderPageHeader provider={provider} />
      <HorizontalNav pages={tabPages} />
    </>
  );
};

export default OpenStackProviderDetailsPage;
