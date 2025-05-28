import type { FC } from 'react';
import { ProviderPageHeadings } from 'src/modules/Providers/views/details/components/ProviderPageHeadings';
import { ProviderCredentialsTabPage1 } from 'src/modules/Providers/views/details/tabs/Credentials/ProviderCredentials';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderCredentialsTabPage from './tabs/Credentials/ProviderCredentialsTabPage';
import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';

const OpenStackProviderDetailsPage: FC<{
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
      component: () => <ProviderCredentialsTabPage1 name={name} namespace={namespace} />,
      href: 'credentials-old',
      name: t('Credentials old'),
    },
    {
      component: () => <ProviderCredentialsTabPage provider={provider} />,
      href: 'credentials',
      name: t('Credentials'),
    },
    {
      component: () => <ProviderVirtualMachinesTabPage provider={provider} />,
      href: 'vms',
      name: t('Virtual Machines'),
    },
  ];

  return (
    <>
      <ProviderPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={tabPages} />
    </>
  );
};

export default OpenStackProviderDetailsPage;
