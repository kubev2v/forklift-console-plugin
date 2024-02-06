import React from 'react';
import { Trans } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderInventory, ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import { VmData } from './components';
import { OpenShiftVirtualMachinesList } from './OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from './OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from './OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from './OVirtVirtualMachinesList';
import { VSphereVirtualMachinesList } from './VSphereVirtualMachinesList';

export interface ProviderVirtualMachinesProps extends RouteComponentProps {
  title?: string;
  obj: ProviderData;
  loaded?: boolean;
  loadError?: unknown;
  onSelect?: (selectedVMs: VmData[]) => void;
  initialSelectedIds?: string[];
}

export const ProviderVirtualMachines: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const { t } = useForkliftTranslation();

  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });
  const obj = { provider, inventory };

  return (
    <>
      <PageSection variant="light" className="forklift-page-section--info">
        <Alert customIcon={<BellIcon />} variant="info" title={t('How to create a migration plan')}>
          <Trans t={t} ns="plugin__forklift-console-plugin">
            To migrate virtual machines from <strong>{name}</strong> provider, select the virtual
            machines to migrate from the list of available virtual machines and click the{' '}
            <strong>Migrate</strong> button.
          </Trans>
        </Alert>
      </PageSection>

      <ProviderVirtualMachinesListWrapper
        obj={obj}
        loaded={providerLoaded}
        loadError={providerLoadError}
      />
    </>
  );
};

export const ProviderVirtualMachinesListWrapper: React.FC<ProviderVirtualMachinesProps> = ({
  title,
  obj,
  loaded,
  loadError,
  onSelect,
  initialSelectedIds,
}) => {
  switch (obj?.provider?.spec?.type) {
    case 'openshift':
      return (
        <OpenShiftVirtualMachinesList
          title={title}
          obj={obj}
          loaded={loaded}
          loadError={loadError}
          onSelect={onSelect}
          initialSelectedIds={initialSelectedIds}
        />
      );
    case 'openstack':
      return (
        <OpenStackVirtualMachinesList
          title={title}
          obj={obj}
          loaded={loaded}
          loadError={loadError}
          onSelect={onSelect}
          initialSelectedIds={initialSelectedIds}
        />
      );
    case 'ovirt':
      return (
        <OVirtVirtualMachinesList
          title={title}
          obj={obj}
          loaded={loaded}
          loadError={loadError}
          onSelect={onSelect}
          initialSelectedIds={initialSelectedIds}
        />
      );
    case 'vsphere':
      return (
        <VSphereVirtualMachinesList
          title={title}
          obj={obj}
          loaded={loaded}
          loadError={loadError}
          onSelect={onSelect}
          initialSelectedIds={initialSelectedIds}
        />
      );
    case 'ova':
      return (
        <OvaVirtualMachinesList
          title={title}
          obj={obj}
          loaded={loaded}
          loadError={loadError}
          onSelect={onSelect}
          initialSelectedIds={initialSelectedIds}
        />
      );
    default:
      // unsupported provider or loading errors will be handled by parent page
      return <></>;
  }
};
