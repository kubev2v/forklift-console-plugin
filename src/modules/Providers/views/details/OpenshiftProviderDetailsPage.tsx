import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import { ProviderPageHeadings } from './components/ProviderPageHeadings';
import { ProviderCredentialsWrapper } from './tabs/Credentials/ProviderCredentials';
import { ProviderDetailsWrapper } from './tabs/Details/ProviderDetails';
import { ProviderNetworksWrapper } from './tabs/Networks/ProviderNetworks';
import { ProviderVirtualMachines } from './tabs/VirtualMachines/ProviderVirtualMachines';
import { ProviderYAMLPageWrapper } from './tabs/YAML/ProviderYAML';

// OpenshiftProviderDetailsPage
export const OpenshiftProviderDetailsPage: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      href: '',
      name: t('Details'),
      component: () => <ProviderDetailsWrapper name={name} namespace={namespace} />,
    },
    {
      href: 'yaml',
      name: t('YAML'),
      component: () => <ProviderYAMLPageWrapper name={name} namespace={namespace} />,
    },
    {
      href: 'credentials',
      name: t('Credentials'),
      component: () => <ProviderCredentialsWrapper name={name} namespace={namespace} />,
    },
    {
      href: 'vms',
      name: t('Virtual Machines'),
      component: () => <ProviderVirtualMachines name={name} namespace={namespace} />,
    },
    {
      href: 'networks',
      name: t('Networks'),
      component: () => <ProviderNetworksWrapper name={name} namespace={namespace} />,
    },
  ];

  return (
    <>
      <ProviderPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={pages} />
    </>
  );
};
