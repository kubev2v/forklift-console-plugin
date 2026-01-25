import type { V1beta1Plan } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { useForkliftTranslation } from '@utils/i18n';

import NameTemplateBody from '../EditNameTemplate/components/NameTemplateBody';
import NameTemplateHelper from '../EditNameTemplate/components/NameTemplateHelper';
import EditNameTemplate from '../EditNameTemplate/EditNameTemplate';

import {
  networkNameTemplateAllowedVariables,
  networkNameTemplateHelperExamples,
} from './utils/constants';

export type EditNetworkNameTemplateProps = {
  resource: V1beta1Plan;
  onConfirmNetworkNameTemplate: (options: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }) => Promise<V1beta1Plan>;
  value?: string;
  allowInherit?: boolean;
};

const EditNetworkNameTemplate: ModalComponent<EditNetworkNameTemplateProps> = ({
  allowInherit = true,
  onConfirmNetworkNameTemplate,
  resource,
  value,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      allowInherit={allowInherit}
      fieldName={allowInherit ? t('VM network name template') : t('Plan network name template')}
      title={t('Edit network name template')}
      value={value}
      onConfirm={async (newValue) => onConfirmNetworkNameTemplate({ newValue, resource })}
      body={
        <NameTemplateBody
          bodyText={t(
            'Network name template is a template for generating network interface names in the target virtual machine.',
          )}
          allowedVariables={networkNameTemplateAllowedVariables}
        />
      }
      helperText={<NameTemplateHelper examples={networkNameTemplateHelperExamples} />}
      inheritValue={resource?.spec?.networkNameTemplate}
      {...rest}
    />
  );
};

export default EditNetworkNameTemplate;
