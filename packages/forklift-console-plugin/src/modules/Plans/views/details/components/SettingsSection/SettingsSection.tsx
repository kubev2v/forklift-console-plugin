import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import { ProviderModelGroupVersionKind, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import {
  PreserveClusterCpuModelDetailsItem,
  PreserveStaticIPsDetailsItem,
  RootDiskDetailsItem,
  SetLUKSEncryptionPasswordsDetailsItem,
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
  const [sourceProvider] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name: obj?.spec?.provider?.source?.name,
    namespace: obj?.spec?.provider?.source?.namespace,
  });

  const [destinationProvider] = useK8sWatchResource<V1beta1Provider>({
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

        <TransferNetworkDetailsItem
          resource={obj}
          canPatch={permissions.canPatch}
          destinationProvider={destinationProvider}
        />

        <TargetNamespaceDetailsItem
          resource={obj}
          canPatch={permissions.canPatch}
          destinationProvider={destinationProvider}
        />

        {['ovirt'].includes(sourceProvider?.spec?.type) && (
          <PreserveClusterCpuModelDetailsItem resource={obj} canPatch={permissions.canPatch} />
        )}

        {['vsphere'].includes(sourceProvider?.spec?.type) && (
          <PreserveStaticIPsDetailsItem resource={obj} canPatch={permissions.canPatch} />
        )}

        {['vsphere'].includes(sourceProvider?.spec?.type) && (
          <SetLUKSEncryptionPasswordsDetailsItem resource={obj} canPatch={permissions.canPatch} />
        )}

        {['vsphere'].includes(sourceProvider?.spec?.type) && (
          <RootDiskDetailsItem resource={obj} canPatch={permissions.canPatch} />
        )}
      </DescriptionList>
    </>
  );
};
