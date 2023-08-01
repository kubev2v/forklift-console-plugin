import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import { ProviderPageHeadings } from './components';
import {
  ProviderCredentialsWrapper,
  ProviderDetailsWrapper,
  ProviderHostsWrapper,
  ProviderVirtualMachinesWrapper,
  ProviderYAMLPageWrapper,
} from './tabs';

// VSphereProviderDetailsPage
export const VSphereProviderDetailsPage: React.FC<{ name: string; namespace: string }> = ({
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
      component: () => <ProviderVirtualMachinesWrapper name={name} namespace={namespace} />,
    },
    {
      href: 'hosts',
      name: t('Hosts'),
      component: () => <ProviderHostsWrapper name={name} namespace={namespace} />,
    },
  ];

  return (
    <>
      <ProviderPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={pages} />
    </>
  );
};
