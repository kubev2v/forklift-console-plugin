import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import type { EnhancedPlan } from '../../utils/types';
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
};

const EditVolumeNameTemplate: FC<EditVolumeNameTemplateProps> = ({
  onConfirmVolumeNameTemplate,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      title={t('Edit volume name template')}
      value={(resource as EnhancedPlan)?.spec?.volumeNameTemplate}
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
    />
  );
};

export default EditVolumeNameTemplate;
