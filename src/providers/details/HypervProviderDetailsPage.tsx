import { type FC, memo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderCredentialsTabPage from './tabs/Credentials/ProviderCredentialsTabPage';
import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';
import type { ProviderDetailsPageProps } from './utils/types';
import ProviderPageHeader from './ProviderPageHeader';

const HypervProviderDetailsPage: FC<ProviderDetailsPageProps> = memo(({ name, namespace }) => {
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
  ];

  return (
    <>
      <ProviderPageHeader name={name} namespace={namespace} />
      <HorizontalNav pages={tabPages} />
    </>
  );
});

export default HypervProviderDetailsPage;
