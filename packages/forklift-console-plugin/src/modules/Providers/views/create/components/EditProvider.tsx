import React from 'react';

import {
  OpenshiftCredentialsEdit,
  OpenstackCredentialsEdit,
  OvirtCredentialsEdit,
  VSphereCredentialsEdit,
} from '../../details';

import { OpenshiftProviderFormCreate } from './OpenshiftProviderCreateForm';
import { OpenstackProviderCreateForm } from './OpenstackProviderCreateForm';
import { OVAProviderCreateForm } from './OVAProviderCreateForm';
import { OvirtProviderCreateForm } from './OvirtProviderCreateForm';
import { ProvidersCreateFormProps } from './ProviderCreateForm';
import { VSphereProviderCreateForm } from './VSphereProviderCreateForm';

export const EditProvider: React.FC<ProvidersCreateFormProps> = ({
  newProvider,
  newSecret,
  onNewProviderChange,
  onNewSecretChange,
}) => {
  switch (newProvider?.spec?.type) {
    case 'openstack':
      return (
        <>
          <OpenstackProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />
          <OpenstackCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
        </>
      );
    case 'openshift':
      return (
        <>
          <OpenshiftProviderFormCreate provider={newProvider} onChange={onNewProviderChange} />
          <OpenshiftCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
        </>
      );
    case 'ovirt':
      return (
        <>
          <OvirtProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />
          <OvirtCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
        </>
      );
    case 'vsphere':
      return (
        <>
          <VSphereProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />
          <VSphereCredentialsEdit secret={newSecret} onChange={onNewSecretChange} />
        </>
      );
    case 'ova':
      return (
        <>
          <OVAProviderCreateForm provider={newProvider} onChange={onNewProviderChange} />
        </>
      );
    default:
      return <></>;
  }
};
