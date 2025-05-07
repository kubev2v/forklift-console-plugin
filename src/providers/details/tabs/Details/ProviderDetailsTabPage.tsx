import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { type ProviderInventory, ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import ConditionsSection from './components/ConditionsSection/ConditionsSection';
import DetailsSection from './components/DetailsSection/DetailsSection';
import InfoSection from './components/InfoSection';
import InventorySection from './components/InventorySection/InventorySection';
import SecretsSection from './components/SecretsSection/SecretsSection';

type ProviderDetailsTabPageProp = {
  provider: V1beta1Provider;
};

const ProviderDetailsTabPage: FC<ProviderDetailsTabPageProp> = ({ provider }) => {
  const { t } = useForkliftTranslation();

  const name = provider?.metadata?.name;
  const namespace = provider?.metadata?.namespace;

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { inventory: inventory ?? undefined, permissions, provider };

  return (
    <div>
      <PageSection variant={PageSectionVariants.light} className="forklift-page-section--info">
        <InfoSection name={name} namespace={namespace} inventory={inventory} />
      </PageSection>

      <PageSection variant={PageSectionVariants.light} className="forklift-page-section--details">
        <SectionHeading text={t('Provider details')} />
        <DetailsSection data={data} />
      </PageSection>

      <PageSection variant={PageSectionVariants.light} className="forklift-page-section">
        <SectionHeading text={t('Secrets')} />
        <SecretsSection data={data} />
      </PageSection>

      <PageSection variant={PageSectionVariants.light} className="forklift-page-section">
        <SectionHeading text={t('Provider inventory')} />
        <InventorySection data={data} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={provider?.status?.conditions} />
      </PageSection>
    </div>
  );
};

export default ProviderDetailsTabPage;
