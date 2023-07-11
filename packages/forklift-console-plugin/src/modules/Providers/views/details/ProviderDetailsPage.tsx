import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  ProviderInventory,
  ProviderModel,
  ProviderModelGroupVersionKind,
  V1beta1Provider,
} from '@kubev2v/types';
import {
  HorizontalNav,
  K8sModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { ProviderActionsDropdown } from '../../actions';
import { useGetDeleteAndEditAccessReview, useProviderInventory } from '../../hooks';
import { PageHeadings } from '../../utils';

import {
  ProviderCredentials,
  ProviderDetails,
  ProviderHosts,
  ProviderNetworks,
  ProviderVirtualMachines,
  ProviderYAMLPage,
} from './tabs';

import './ProviderDetailsPage.style.css';

export const ProviderDetailsPage: React.FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const { inventory } = useProviderInventory<ProviderInventory>({
    provider,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: ProviderModel,
    namespace,
  });

  const data = { provider, inventory, permissions };
  const alerts = [];
  const loaded = providerLoaded;
  const loadError = providerLoadError;
  const type = provider?.spec?.type;

  const providerHasSecret = provider?.spec?.secret?.name;
  const providerHasHosts = ['vsphere'].includes(type);
  const ProviderHasVirtualMachines = ['openshift', 'openstack', 'ovirt', 'vsphere'].includes(type);
  const providerHasNetworks = ['openshift'].includes(type);

  const pages = [
    {
      href: '',
      name: t('Details'),
      component: () => {
        return <ProviderDetails obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
      },
    },
    {
      href: 'yaml',
      name: t('YAML'),
      component: () => {
        return (
          <ProviderYAMLPage
            obj={data}
            loaded={providerLoaded}
            loadError={providerLoadError}
          ></ProviderYAMLPage>
        );
      },
    },
    providerHasSecret && {
      href: 'credentials',
      name: t('Credentials'),
      component: () => {
        return (
          <ProviderCredentials
            obj={data}
            loaded={loaded}
            loadError={loadError}
          ></ProviderCredentials>
        );
      },
    },

    ProviderHasVirtualMachines && {
      href: 'vms',
      name: t('Virtual Machines'),
      component: () => {
        return (
          <ProviderVirtualMachines
            obj={data}
            loaded={loaded}
            loadError={loadError}
          ></ProviderVirtualMachines>
        );
      },
    },

    providerHasHosts && {
      href: 'hosts',
      name: t('Hosts'),
      component: () => {
        return <ProviderHosts obj={data} loaded={loaded} loadError={loadError}></ProviderHosts>;
      },
    },

    providerHasNetworks && {
      href: 'networks',
      name: t('Networks'),
      component: () => {
        return (
          <ProviderNetworks obj={data} loaded={loaded} loadError={loadError}></ProviderNetworks>
        );
      },
    },
  ];

  return (
    <>
      <PageHeadings
        model={ProviderModel}
        obj={data?.provider}
        namespace={namespace}
        actions={<ProviderActionsDropdown data={data} fieldId={''} fields={[]} />}
      >
        {alerts && alerts.length > 0 && (
          <PageSection className="forklift-page-headings-alerts">{alerts}</PageSection>
        )}
      </PageHeadings>
      <HorizontalNav pages={pages.filter((p) => p)} />
    </>
  );
};
ProviderDetailsPage.displayName = 'ProviderDetails';

type ProviderDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

export default ProviderDetailsPage;
