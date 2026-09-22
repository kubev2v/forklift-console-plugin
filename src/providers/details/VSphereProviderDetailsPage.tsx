import { type FC, memo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderCredentialsTabPage from './tabs/Credentials/ProviderCredentialsTabPage';
import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderHostsTabPage from './tabs/Hosts/ProviderHostsTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';
import type { ProviderDetailsPageProps } from './utils/types';
import ProviderDetailsLayout from './ProviderDetailsLayout';

const VSphereProviderDetailsPage: FC<ProviderDetailsPageProps> = memo(({ name, namespace }) => {
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
      component: () => <ProviderHostsTabPage name={name} namespace={namespace} />,
      href: 'hosts',
      name: t('ESXi hosts'),
    },
  ];

  return <ProviderDetailsLayout name={name} namespace={namespace} tabPages={tabPages} />;
});

export default VSphereProviderDetailsPage;
