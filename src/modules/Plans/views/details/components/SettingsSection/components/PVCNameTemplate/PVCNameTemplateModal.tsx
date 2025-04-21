import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { SettingsEditModalProps } from '../../utils/types';
import NameTemplateModalBody from '../NameTemplate/NameTemplateModal/components/NameTemplateModalBody/NameTemplateModalBody';
import NameTemplateModalHelper from '../NameTemplate/NameTemplateModal/components/NameTemplateModalHelper/NameTemplateModalHelper';
import NameTemplateModal from '../NameTemplate/NameTemplateModal/NameTemplateModal';

import {
  getPVCNameTemplateAllowedVariables,
  pvcNameTemplateHelperExamples,
} from './utils/constants';

const PVCNameTemplateModal: FC<SettingsEditModalProps> = ({ jsonPath, resource, title }) => {
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
          allowedVariables={getPVCNameTemplateAllowedVariables()}
        />
      }
      helperText={<NameTemplateModalHelper examples={pvcNameTemplateHelperExamples} />}
    />
  );
};

export default PVCNameTemplateModal;
