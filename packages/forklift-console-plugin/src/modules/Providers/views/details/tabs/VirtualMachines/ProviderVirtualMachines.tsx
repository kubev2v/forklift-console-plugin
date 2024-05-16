import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ProviderData } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import { useInventoryVms } from './utils/useInventoryVms';
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
  showActions: boolean;
  className?: string;
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

  const [vmData, vmDataLoading] = useInventoryVms({ provider }, providerLoaded, providerLoadError);
  const obj = { provider, vmData, vmDataLoading };

  return (
    <>
      <PageSection variant="light" className="forklift-page-section--info">
        {vmData?.length > 0 && (
          <Alert
            customIcon={<BellIcon />}
            variant="info"
            title={t('How to create a migration plan')}
          >
            <ForkliftTrans>
              To migrate virtual machines from <strong>{name}</strong> provider, select the virtual
              machines to migrate from the list of available virtual machines and click the{' '}
              <strong>Create migration plan</strong> button.
            </ForkliftTrans>
          </Alert>
        )}
      </PageSection>

      <ProviderVirtualMachinesListWrapper
        obj={obj}
        loaded={providerLoaded}
        loadError={providerLoadError}
        showActions={true}
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
  showActions,
  className,
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
          showActions={showActions}
          className={className}
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
          showActions={showActions}
          className={className}
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
          showActions={showActions}
          className={className}
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
          showActions={showActions}
          className={className}
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
          showActions={showActions}
          className={className}
        />
      );
    default:
      // unsupported provider or loading errors will be handled by parent page
      return <></>;
  }
};
