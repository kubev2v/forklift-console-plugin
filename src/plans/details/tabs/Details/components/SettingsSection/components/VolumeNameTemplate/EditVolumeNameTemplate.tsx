import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import NameTemplateBody from '../EditNameTemplate/components/NameTemplateBody';
import NameTemplateHelper from '../EditNameTemplate/components/NameTemplateHelper';
import EditNameTemplate from '../EditNameTemplate/EditNameTemplate';

import {
  volumeNameTemplateAllowedVariables,
  volumeNameTemplateHelperExamples,
} from './utils/constants';

type EditVolumeNameTemplateProps = {
  resource: V1beta1Plan;
  onConfirmVolumeNameTemplate: (options: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }) => Promise<V1beta1Plan>;
  value?: string;
  allowInherit?: boolean;
};

const EditVolumeNameTemplate: FC<EditVolumeNameTemplateProps> = ({
  allowInherit = true,
  onConfirmVolumeNameTemplate,
  resource,
  value,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      allowInherit={allowInherit}
      fieldName={allowInherit ? t('VM volume name template') : t('Plan volume name template')}
      title={t('Edit volume name template')}
      value={value}
      onConfirm={async (newValue) => onConfirmVolumeNameTemplate({ newValue, resource })}
      body={
        <NameTemplateBody
          bodyText={t(
            'Volume name template is a template for generating volume interface names in the target virtual machine.',
          )}
          allowedVariables={volumeNameTemplateAllowedVariables}
        />
      }
      helperText={<NameTemplateHelper examples={volumeNameTemplateHelperExamples} />}
      inheritValue={resource?.spec?.volumeNameTemplate}
    />
  );
};

export default EditVolumeNameTemplate;
