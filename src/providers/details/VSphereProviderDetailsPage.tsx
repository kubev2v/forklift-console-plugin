import type { FC } from 'react';
import { ProviderPageHeadings } from 'src/modules/Providers/views/details/components/ProviderPageHeadings';
import { ProviderCredentialsTabPage } from 'src/modules/Providers/views/details/tabs/Credentials/ProviderCredentials';
import { ProviderHostsTabPage } from 'src/modules/Providers/views/details/tabs/Hosts/ProviderHosts';
import { ProviderVirtualMachinesTabPage } from 'src/modules/Providers/views/details/tabs/VirtualMachines/ProviderVirtualMachines';
import { ProviderYAMLTabPage } from 'src/modules/Providers/views/details/tabs/YAML/ProviderYAML';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';

const VSphereProviderDetailsPage: FC<{
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
      name: t('Virtual Machines'),
    },
    {
      component: () => <ProviderHostsTabPage name={name} namespace={namespace} />,
      href: 'hosts',
      name: t('Hosts'),
    },
  ];

  return (
    <>
      <ProviderPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={tabPages} />
    </>
  );
};

export default VSphereProviderDetailsPage;
