import type { FC } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import { useForkliftTranslation } from '@utils/i18n';

import OpenshiftInventorySection from './OpenshiftInventorySection';
import OpenstackInventorySection from './OpenstackInventorySection';
import OVAInventorySection from './OVAInventorySection';
import OvirtInventorySection from './OvirtInventorySection';
import VSphereInventorySection from './VSphereInventorySection';

export type InventorySectionProps = {
  data: ProviderData;
};

const InventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { inventory, provider } = data;
  if (!provider || !inventory) {
    return <span className="text-muted">{t('No inventory data available.')}</span>;
  }

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
