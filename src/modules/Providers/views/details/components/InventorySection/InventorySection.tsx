import type { FC } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import { OpenshiftInventorySection } from './OpenshiftInventorySection';
import { OpenstackInventorySection } from './OpenstackInventorySection';
import { OVAInventorySection } from './OVAInventorySection';
import { OvirtInventorySection } from './OvirtInventorySection';
import { VSphereInventorySection } from './VSphereInventorySection';

export const InventorySection: FC<InventoryProps> = (props) => {
  const { provider } = props.data;

  switch (provider?.spec?.type) {
    case 'ovirt':
      return <OvirtInventorySection {...props} />;
    case 'openshift':
      return <OpenshiftInventorySection {...props} />;
    case 'openstack':
      return <OpenstackInventorySection {...props} />;
    case 'vsphere':
      return <VSphereInventorySection {...props} />;
    case 'ova':
      return <OVAInventorySection {...props} />;
    default:
      return <></>;
  }
};

export type InventoryProps = {
  data: ProviderData;
};
