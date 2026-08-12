import type { V1beta1Plan } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { useForkliftTranslation } from '@utils/i18n';

import NameTemplateBody from '../EditNameTemplate/components/NameTemplateBody';
import NameTemplateHelper from '../EditNameTemplate/components/NameTemplateHelper';
import EditNameTemplate from '../EditNameTemplate/EditNameTemplate';

import {
  volumeNameTemplateAllowedVariables,
  volumeNameTemplateHelperExamples,
} from './utils/constants';

export type EditVolumeNameTemplateProps = {
  allowInherit?: boolean;
  onConfirmVolumeNameTemplate: (options: {
    newValue: string | undefined;
    resource: V1beta1Plan;
  }) => Promise<V1beta1Plan>;
  resource: V1beta1Plan;
  value?: string;
};

const EditVolumeNameTemplate: ModalComponent<EditVolumeNameTemplateProps> = ({
  allowInherit = true,
  onConfirmVolumeNameTemplate,
  resource,
  value,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      allowInherit={allowInherit}
      body={
        <NameTemplateBody
          allowedVariables={volumeNameTemplateAllowedVariables}
          bodyText={t(
            'Volume name template is a template for generating volume interface names in the target virtual machine.',
          )}
        />
      }
      fieldName={allowInherit ? t('VM volume name template') : t('Plan volume name template')}
      helperText={<NameTemplateHelper examples={volumeNameTemplateHelperExamples} />}
      inheritValue={resource?.spec?.volumeNameTemplate}
      onConfirm={async (newValue) => onConfirmVolumeNameTemplate({ newValue, resource })}
      title={t('Edit volume name template')}
      value={value}
      {...rest}
    />
  );
};

export default EditVolumeNameTemplate;
