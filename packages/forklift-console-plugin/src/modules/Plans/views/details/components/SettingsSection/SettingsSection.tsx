import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import { ProviderModelGroupVersionKind, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import { Suspend } from '../Suspend';

import {
  PreserveClusterCpuModelDetailsItem,
  PreserveStaticIPsDetailsItem,
  TargetNamespaceDetailsItem,
  TransferNetworkDetailsItem,
  WarmDetailsItem,
} from './components';

export const SettingsSection: React.FC<SettingsSectionProps> = (props) => (
  <ModalHOC>
    <SettingsSectionInternal {...props} />
  </ModalHOC>
);

export type SettingsSectionProps = {
  obj: V1beta1Plan;
  permissions: ProvidersPermissionStatus;
};

export const SettingsSectionInternal: React.FC<SettingsSectionProps> = ({ obj, permissions }) => {
  const [sourceProvider, loaded, loadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name: obj?.spec?.provider?.source?.name,
    namespace: obj?.spec?.provider?.source?.namespace,
  });

  const [destinationProvider, destinationLoaded, destinationLoadError] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      namespaced: true,
      name: obj?.spec?.provider?.destination?.name,
      namespace: obj?.spec?.provider?.destination?.namespace,
    });

  return (
    <>
      <DescriptionList
        columnModifier={{
          default: '2Col',
        }}
      >
        {['vsphere', 'ovirt'].includes(sourceProvider?.spec?.type) && (
          <WarmDetailsItem resource={obj} canPatch={permissions.canPatch} />
        )}

        <Suspend
          obj={destinationProvider}
          loaded={destinationLoaded}
          loadError={destinationLoadError}
        >
          <TransferNetworkDetailsItem
            resource={obj}
            canPatch={permissions.canPatch}
            destinationProvider={destinationProvider}
          />
        </Suspend>

        <Suspend
          obj={destinationProvider}
          loaded={destinationLoaded}
          loadError={destinationLoadError}
        >
          <TargetNamespaceDetailsItem
            resource={obj}
            canPatch={permissions.canPatch}
            destinationProvider={destinationProvider}
          />
        </Suspend>

        {['ovirt'].includes(sourceProvider?.spec?.type) && (
          <Suspend obj={sourceProvider} loaded={loaded} loadError={loadError}>
            <PreserveClusterCpuModelDetailsItem resource={obj} canPatch={permissions.canPatch} />
          </Suspend>
        )}
        {['vsphere'].includes(sourceProvider?.spec?.type) && (
          <Suspend obj={sourceProvider} loaded={loaded} loadError={loadError}>
            <PreserveStaticIPsDetailsItem resource={obj} canPatch={permissions.canPatch} />
          </Suspend>
        )}
      </DescriptionList>
    </>
  );
};
