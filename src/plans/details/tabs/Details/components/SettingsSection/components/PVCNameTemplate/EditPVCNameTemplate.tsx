import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import type { EnhancedPlan } from '../../utils/types';
import NameTemplateBody from '../EditNameTemplate/components/NameTemplateBody';
import NameTemplateHelper from '../EditNameTemplate/components/NameTemplateHelper';
import EditNameTemplate from '../EditNameTemplate/EditNameTemplate';

import { pvcNameTemplateAllowedVariables, pvcNameTemplateHelperExamples } from './utils/constants';

type EditPVCNameTemplateProps = {
  resource: V1beta1Plan;
  onConfirmPVCNameTemplate: (options: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }) => Promise<V1beta1Plan>;
};

const EditPVCNameTemplate: FC<EditPVCNameTemplateProps> = ({
  onConfirmPVCNameTemplate,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      title={t('Edit PVC name template')}
      value={(resource as EnhancedPlan)?.spec?.pvcNameTemplate}
      onConfirm={async (newValue) => onConfirmPVCNameTemplate({ newValue, resource })}
      body={
        <NameTemplateBody
          bodyText={t(
            'PVC name template is a template for generating persistent volume claims (PVC) names for VM disks.',
          )}
          allowedVariables={pvcNameTemplateAllowedVariables}
        />
      }
      helperText={<NameTemplateHelper examples={pvcNameTemplateHelperExamples} />}
    />
  );
};

export default EditPVCNameTemplate;
