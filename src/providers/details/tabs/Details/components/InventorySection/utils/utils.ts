import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import OpenshiftInventorySection from '../OpenshiftInventorySection';
import OpenstackInventorySection from '../OpenstackInventorySection';
import OVAInventorySection from '../OVAInventorySection';
import OvirtInventorySection from '../OvirtInventorySection';
import VSphereInventorySection from '../VSphereInventorySection';

import type { InventorySectionProps } from './types';

export const getInventorySectionByType = (
  type: string | undefined,
): FC<InventorySectionProps> | undefined => {
  switch (type) {
    case PROVIDER_TYPES.ovirt:
      return OvirtInventorySection;
    case PROVIDER_TYPES.openshift:
      return OpenshiftInventorySection;
    case PROVIDER_TYPES.openstack:
      return OpenstackInventorySection;
    case PROVIDER_TYPES.vsphere:
      return VSphereInventorySection;
    case PROVIDER_TYPES.ova:
      return OVAInventorySection;
    case undefined:
    default:
      return undefined;
  }
};
