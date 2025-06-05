import type { FC } from 'react';
import { PROVIDER_TYPES, VSphereEndpointType } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@kubev2v/types';

import EsxiCredentialsEdit from '../EsxiCredentialsEdit';
import OpenshiftCredentialsEdit from '../OpenshiftCredentialsEdit';
import OpenstackCredentialsEdit from '../OpenstackCredentialsEdit';
import OvirtCredentialsEdit from '../OvirtCredentialsEdit';
import VCenterCredentialsEdit from '../VCenterCredentialsEdit';

import type { CredentialsEditModeByTypeProps } from './types';

export const getCredentialsEditModeByType = (
  provider: V1beta1Provider,
): FC<CredentialsEditModeByTypeProps> | null => {
  const sdkEndpoint = provider?.spec?.settings?.sdkEndpoint ?? VSphereEndpointType.vCenter;

  switch (provider?.spec?.type) {
    case PROVIDER_TYPES.ovirt:
      return OvirtCredentialsEdit;
    case PROVIDER_TYPES.openshift:
      return OpenshiftCredentialsEdit;
    case PROVIDER_TYPES.openstack:
      return OpenstackCredentialsEdit;
    case PROVIDER_TYPES.vsphere:
      if ((sdkEndpoint as VSphereEndpointType) === VSphereEndpointType.ESXi) {
        return EsxiCredentialsEdit;
      }
      return VCenterCredentialsEdit;
    case undefined:
    default:
      return null;
  }
};
