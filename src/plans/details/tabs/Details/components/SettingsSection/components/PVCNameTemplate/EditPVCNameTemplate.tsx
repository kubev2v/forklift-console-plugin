import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

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
  value?: string;
  allowInherit?: boolean;
};

const EditPVCNameTemplate: FC<EditPVCNameTemplateProps> = ({
  allowInherit = true,
  onConfirmPVCNameTemplate,
  resource,
  value,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      allowInherit={allowInherit}
      fieldName={allowInherit ? t('VM PVC name template') : t('Plan PVC name template')}
      title={t('Edit PVC name template')}
      value={value}
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
      inheritValue={resource?.spec?.pvcNameTemplate}
    />
  );
};

export default EditPVCNameTemplate;
