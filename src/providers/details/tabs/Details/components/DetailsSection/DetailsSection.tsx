import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { PageSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { DetailsSectionProps } from './utils/types';
import { getDetailsSectionByType } from './utils/utils';

const DetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { permissions, provider } = data;

  if (isEmpty(provider) || isEmpty(permissions))
    return <span className="text-muted">{t('No provider data available.')}</span>;

  const DetailsSectionByType = getDetailsSectionByType(provider?.spec?.type);
  if (!DetailsSectionByType) return null;

  return (
    <PageSection hasBodyWrapper={false} className="forklift-page-section--details">
      <SectionHeading text={t('Provider details')} />
      <DetailsSectionByType data={data} />
    </PageSection>
  );
};

export default DetailsSection;
