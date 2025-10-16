import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import SectionHeading from '@components/headers/SectionHeading';
import OvaFileUploader from '@components/OvaFileUploader/OvaFileUploader';
import { PageSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { DetailsSectionProps } from './utils/types';

const UploadFilesSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { permissions, provider } = data;

  if (isEmpty(provider) || isEmpty(permissions))
    return <span className="text-muted">{t('No provider data available.')}</span>;

  if (provider?.spec?.type !== PROVIDER_TYPES.ova) return null;

  return (
    <ModalHOC>
      <PageSection hasBodyWrapper={false} className="forklift-page-section--details">
        <SectionHeading text={t('Upload local OVA files')} />
        <OvaFileUploader provider={provider} />
      </PageSection>
    </ModalHOC>
  );
};

export default UploadFilesSection;
