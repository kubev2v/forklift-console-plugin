import { type FC, memo, useMemo } from 'react';
import { isHypervClusterProvider } from 'src/providers/utils/helpers/isHypervClusterProvider';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import { useProvider } from './hooks/useProvider';
import ProviderCredentialsTabPage from './tabs/Credentials/ProviderCredentialsTabPage';
import ProviderDetailsTabPage from './tabs/Details/ProviderDetailsTabPage';
import ProviderHostsTabPage from './tabs/Hosts/ProviderHostsTabPage';
import ProviderVirtualMachinesTabPage from './tabs/VirtualMachines/ProviderVirtualMachinesTabPage';
import ProviderYAMLTabPage from './tabs/YAML/ProviderYAMLTabPage';
import type { ProviderDetailsPageProps } from './utils/types';
import ProviderPageHeader from './ProviderPageHeader';

const HypervProviderDetailsPage: FC<ProviderDetailsPageProps> = memo(({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);
  const isCluster = isHypervClusterProvider(provider);

  const tabPages: NavPage[] = useMemo(() => {
    const pages: NavPage[] = [
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

    if (isCluster) {
      pages.push({
        component: () => <ProviderHostsTabPage name={name} namespace={namespace} />,
        href: 'hosts',
        name: t('Hosts'),
      });
    }

    return pages;
  }, [name, namespace, t, isCluster]);

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

export default HypervProviderDetailsPage;
