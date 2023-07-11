import React from 'react';
import { ProviderData } from 'src/modules/ProvidersNG/utils';

import { OpenshiftInventorySection } from './OpenshiftInventorySection';
import { OpenstackInventorySection } from './OpenstackInventorySection';
import { OvirtInventorySection } from './OvirtInventorySection';
import { VSphereInventorySection } from './VSphereInventorySection';

export const InventorySection: React.FC<InventoryProps> = (props) => {
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
    default:
      return <></>;
  }
};

export type InventoryProps = {
  data: ProviderData;
};
