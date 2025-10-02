import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { InventorySectionProps } from './utils/types';
import { getInventorySectionByType } from './utils/utils';

const InventorySection: FC<InventorySectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { inventory, provider } = data;

  if (isEmpty(provider) || isEmpty(inventory)) {
    return <span className="text-muted">{t('No inventory data available.')}</span>;
  }

  const InventorySectionByType = getInventorySectionByType(provider?.spec?.type);

  if (!InventorySectionByType) return null;

  return (
    <PageSection variant={PageSectionVariants.light} className="forklift-page-section--details">
      <SectionHeading text={t('Provider inventory')} />
      <InventorySectionByType data={data} />
    </PageSection>
  );
};

export default InventorySection;
