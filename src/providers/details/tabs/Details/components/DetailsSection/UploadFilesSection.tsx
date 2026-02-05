import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import SectionHeading from '@components/headers/SectionHeading';
import OvaFileUploader from '@components/OvaFileUploader/OvaFileUploader';
import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import { Flex, PageSection } from '@patternfly/react-core';
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
    <PageSection hasBodyWrapper={false} className="forklift-page-section--details">
      <SectionHeading
        text={
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            direction={{ default: 'row' }}
            gap={{ default: 'gapSm' }}
          >
            {t('Upload local OVA file')}
            <TechPreviewLabel />
          </Flex>
        }
        testId="ova-upload-section-heading"
      />
      <OvaFileUploader provider={provider} />
    </PageSection>
  );
};

export default UploadFilesSection;
