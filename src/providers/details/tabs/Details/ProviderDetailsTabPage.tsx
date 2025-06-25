import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { type ProviderInventory, ProviderModel } from '@kubev2v/types';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import ConditionsSection from './components/ConditionsSection/ConditionsSection';
import DetailsSection from './components/DetailsSection/DetailsSection';
import InventorySection from './components/InventorySection/InventorySection';
import SecretsSection from './components/SecretsSection/SecretsSection';

const ProviderDetailsTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { inventory: inventory ?? undefined, permissions, provider };

  return (
    <ModalHOC>
      <div>
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
    </ModalHOC>
  );
};

export default ProviderDetailsTabPage;
