import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { PageSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import { getInventorySectionByType } from './utils/utils';

const InventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { inventory, provider } = data;

  const InventorySectionByType = getInventorySectionByType(provider?.spec?.type);

  const hasInventory = !isEmpty(provider) && !isEmpty(inventory);

  return (
    <PageSection hasBodyWrapper={false} className="forklift-page-section">
      <SectionHeading text={t('Provider inventory')} />
      {!hasInventory && <span className="text-muted">{t('No inventory data available.')}</span>}
      {hasInventory && InventorySectionByType && <InventorySectionByType data={data} />}
    </PageSection>
  );
};

export default InventorySection;
