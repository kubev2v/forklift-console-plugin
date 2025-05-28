import type { FC } from 'react';
import { PROVIDER_TYPES, VSphereEndpointType } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@kubev2v/types';

import EsxiCredentialsViewMode from '../EsxiCredentialsViewMode';
import OpenshiftCredentialsViewMode from '../OpenshiftCredentialsViewMode';
import OpenstackCredentialsViewMode from '../OpenstackCredentialsViewMode';
import OvirtCredentialsViewMode from '../OvirtCredentialsViewMode';
import VCenterCredentialsViewMode from '../VCenterCredentialsViewMode';

import type { CredentialsViewModeByTypeProps } from './types';

export const getCredentialsViewModeByType = (
  provider: V1beta1Provider,
): FC<CredentialsViewModeByTypeProps> | null => {
  const sdkEndpoint = provider?.spec?.settings?.sdkEndpoint ?? VSphereEndpointType.vCenter;

  switch (provider?.spec?.type) {
    case PROVIDER_TYPES.ovirt:
      return OvirtCredentialsViewMode;
    case PROVIDER_TYPES.openshift:
      return OpenshiftCredentialsViewMode;
    case PROVIDER_TYPES.openstack:
      return OpenstackCredentialsViewMode;
    case PROVIDER_TYPES.vsphere:
      if ((sdkEndpoint as VSphereEndpointType) === VSphereEndpointType.ESXi) {
        return EsxiCredentialsViewMode;
      }
      return VCenterCredentialsViewMode;

    case undefined:
    default:
      return null;
  }
};
