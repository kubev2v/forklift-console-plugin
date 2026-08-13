import type { V1beta1Plan } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { useForkliftTranslation } from '@utils/i18n';

import NameTemplateBody from '../EditNameTemplate/components/NameTemplateBody';
import NameTemplateHelper from '../EditNameTemplate/components/NameTemplateHelper';
import EditNameTemplate from '../EditNameTemplate/EditNameTemplate';

import {
  networkNameTemplateAllowedVariables,
  networkNameTemplateHelperExamples,
} from './utils/constants';

export type EditNetworkNameTemplateProps = {
  allowInherit?: boolean;
  onConfirmNetworkNameTemplate: (options: {
    newValue: string | undefined;
    resource: V1beta1Plan;
  }) => Promise<V1beta1Plan>;
  resource: V1beta1Plan;
  value?: string;
};

const EditNetworkNameTemplate: OverlayComponent<EditNetworkNameTemplateProps> = ({
  allowInherit = true,
  closeOverlay,
  onConfirmNetworkNameTemplate,
  resource,
  value,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      allowInherit={allowInherit}
      body={
        <NameTemplateBody
          allowedVariables={networkNameTemplateAllowedVariables}
          bodyText={t(
            'Network name template is a template for generating network interface names in the target virtual machine.',
          )}
        />
      }
      closeOverlay={closeOverlay}
      fieldName={allowInherit ? t('VM network name template') : t('Plan network name template')}
      helperText={<NameTemplateHelper examples={networkNameTemplateHelperExamples} />}
      inheritValue={resource?.spec?.networkNameTemplate}
      onConfirm={async (newValue) => onConfirmNetworkNameTemplate({ newValue, resource })}
      title={t('Edit network name template')}
      value={value}
    />
  );
};

export default EditNetworkNameTemplate;
