import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import SectionHeading from '@components/headers/SectionHeading';
import OvaFileUploader from '@components/OvaFileUploader/OvaFileUploader';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { DetailsSectionProps } from './utils/types';
import { isApplianceManagementEnabled } from './utils/utils';

const UploadFilesSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { permissions, provider } = data;

  if (isEmpty(provider) || isEmpty(permissions))
    return <span className="text-muted">{t('No provider data available.')}</span>;

  if (provider?.spec?.type !== PROVIDER_TYPES.ova) return null;
  if (!isApplianceManagementEnabled(provider)) return null;

  return (
    <PageSection variant={PageSectionVariants.light} className="forklift-page-section--details">
      <SectionHeading text={t('Upload local OVA files')} />
      <OvaFileUploader provider={provider} />
    </PageSection>
  );
};

export default UploadFilesSection;
