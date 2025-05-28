import { PROVIDER_TYPES, VSphereEndpointType } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@kubev2v/types';

import { esxiSecretValidator } from './esxiSecretValidator';
import { openshiftSecretValidator } from './openshiftSecretValidator';
import { openstackSecretValidator } from './openstackSecretValidator';
import { ovirtSecretValidator } from './ovirtSecretValidator';
import { vcenterSecretValidator } from './vcenterSecretValidator';

export const getCredentialsValidatorByType = (provider: V1beta1Provider) => {
  const sdkEndpoint = provider?.spec?.settings?.sdkEndpoint ?? VSphereEndpointType.vCenter;

  switch (provider?.spec?.type) {
    case PROVIDER_TYPES.ovirt:
      return ovirtSecretValidator;
    case PROVIDER_TYPES.openshift:
      return openshiftSecretValidator;
    case PROVIDER_TYPES.openstack:
      return openstackSecretValidator;
    case PROVIDER_TYPES.vsphere:
      if ((sdkEndpoint as VSphereEndpointType) === VSphereEndpointType.ESXi) {
        return esxiSecretValidator;
      }
      return vcenterSecretValidator;
    case undefined:
    default:
      return null;
  }
};
