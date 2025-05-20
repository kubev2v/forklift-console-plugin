import type { FC } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

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
    case PROVIDER_TYPES.ovirt:
      return <OvirtInventorySection data={data} />;
    case PROVIDER_TYPES.openshift:
      return <OpenshiftInventorySection data={data} />;
    case PROVIDER_TYPES.openstack:
      return <OpenstackInventorySection data={data} />;
    case PROVIDER_TYPES.vsphere:
      return <VSphereInventorySection data={data} />;
    case PROVIDER_TYPES.ova:
      return <OVAInventorySection data={data} />;
    case undefined:
    default:
      return <></>;
  }
};

export default InventorySection;
