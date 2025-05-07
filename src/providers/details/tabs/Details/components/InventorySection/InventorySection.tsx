import type { FC } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { OpenshiftInventorySection } from 'src/modules/Providers/views/details/components/InventorySection/OpenshiftInventorySection';
import { OpenstackInventorySection } from 'src/modules/Providers/views/details/components/InventorySection/OpenstackInventorySection';
import { OVAInventorySection } from 'src/modules/Providers/views/details/components/InventorySection/OVAInventorySection';
import { OvirtInventorySection } from 'src/modules/Providers/views/details/components/InventorySection/OvirtInventorySection';
import { VSphereInventorySection } from 'src/modules/Providers/views/details/components/InventorySection/VSphereInventorySection';

export type InventorySectionProps = {
  data: ProviderData;
};

const InventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { provider } = data;

  switch (provider?.spec?.type) {
    case 'ovirt':
      return <OvirtInventorySection data={data} />;
    case 'openshift':
      return <OpenshiftInventorySection data={data} />;
    case 'openstack':
      return <OpenstackInventorySection data={data} />;
    case 'vsphere':
      return <VSphereInventorySection data={data} />;
    case 'ova':
      return <OVAInventorySection data={data} />;
    case undefined:
    default:
      return <></>;
  }
};

export default InventorySection;
