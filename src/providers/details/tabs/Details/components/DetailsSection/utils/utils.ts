import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import OpenshiftDetailsSection from '../OpenshiftDetailsSection';
import OpenstackDetailsSection from '../OpenstackDetailsSection';
import OVADetailsSection from '../OVADetailsSection';
import OvirtDetailsSection from '../OvirtDetailsSection';
import VSphereDetailsSection from '../VSphereDetailsSection';

import type { DetailsSectionProps } from './types';

export const getDetailsSectionByType = (
  type: string | undefined,
): FC<DetailsSectionProps> | undefined => {
  switch (type) {
    case PROVIDER_TYPES.ovirt:
      return OvirtDetailsSection;
    case PROVIDER_TYPES.openshift:
      return OpenshiftDetailsSection;
    case PROVIDER_TYPES.openstack:
      return OpenstackDetailsSection;
    case PROVIDER_TYPES.vsphere:
      return VSphereDetailsSection;
    case PROVIDER_TYPES.ova:
      return OVADetailsSection;
    case undefined:
    default:
      return undefined;
  }
};
