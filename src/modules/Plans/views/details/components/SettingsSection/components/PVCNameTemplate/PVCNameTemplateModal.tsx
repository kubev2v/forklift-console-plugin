import React, { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  getPVCNameTemplateAllowedVariables,
  pvcNameTemplateHelperExamples,
} from './utils/constants';
import { SettingsEditModalProps } from '../../utils/types';
import NameTemplateModalBody from '../NameTemplate/NameTemplateModal/components/NameTemplateModalBody/NameTemplateModalBody';
import NameTemplateModalHelper from '../NameTemplate/NameTemplateModal/components/NameTemplateModalHelper/NameTemplateModalHelper';
import NameTemplateModal from '../NameTemplate/NameTemplateModal/NameTemplateModal';

const PVCNameTemplateModal: FC<SettingsEditModalProps> = ({ title, jsonPath, resource }) => {
  const { t } = useForkliftTranslation();

  return (
    <NameTemplateModal
      resource={resource}
      title={title ?? t('Edit PVC name template')}
      jsonPath={jsonPath}
      body={
        <NameTemplateModalBody
          bodyText={t(
            'PVC name template is a template for generating persistent volume claims (PVC) names for VM disks.',
          )}
          allowedVariables={getPVCNameTemplateAllowedVariables(t)}
        />
      }
      helperText={<NameTemplateModalHelper examples={pvcNameTemplateHelperExamples} />}
    />
  );
};

export default PVCNameTemplateModal;
