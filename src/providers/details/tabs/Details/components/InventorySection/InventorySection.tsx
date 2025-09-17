import type { FC } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import SectionHeading from '@components/headers/SectionHeading';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
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

  const getInventorySectionByType = (
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

  if (!provider || !inventory) {
    return <span className="text-muted">{t('No inventory data available.')}</span>;
  }

  const InventorySectionByType = getInventorySectionByType(provider?.spec?.type);

  return (
    InventorySectionByType && (
      <PageSection variant={PageSectionVariants.light} className="forklift-page-section--details">
        <SectionHeading text={t('Provider inventory')} />
        {InventorySectionByType && <InventorySectionByType data={data} />}
      </PageSection>
    )
  );
};

export default InventorySection;
