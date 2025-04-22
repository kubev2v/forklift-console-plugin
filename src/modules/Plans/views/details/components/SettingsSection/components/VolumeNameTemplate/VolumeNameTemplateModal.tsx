import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { SettingsEditModalProps } from '../../utils/types';
import NameTemplateModalBody from '../NameTemplate/NameTemplateModal/components/NameTemplateModalBody/NameTemplateModalBody';
import NameTemplateModalHelper from '../NameTemplate/NameTemplateModal/components/NameTemplateModalHelper/NameTemplateModalHelper';
import NameTemplateModal from '../NameTemplate/NameTemplateModal/NameTemplateModal';

import {
  getVolumeNameTemplateAllowedVariables,
  volumeNameTemplateHelperExamples,
} from './utils/constants';

const VolumeNameTemplateModal: FC<SettingsEditModalProps> = ({ jsonPath, resource, title }) => {
  const { t } = useForkliftTranslation();

  return (
    <NameTemplateModal
      resource={resource}
      title={title ?? t('Edit volume name template')}
      jsonPath={jsonPath}
      body={
        <NameTemplateModalBody
          bodyText={t(
            'Volume name template is a template for generating volume interface names in the target virtual machine.',
          )}
          allowedVariables={getVolumeNameTemplateAllowedVariables()}
        />
      }
      helperText={<NameTemplateModalHelper examples={volumeNameTemplateHelperExamples} />}
    />
  );
};

export default VolumeNameTemplateModal;
