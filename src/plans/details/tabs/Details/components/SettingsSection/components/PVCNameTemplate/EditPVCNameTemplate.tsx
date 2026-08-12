import type { V1beta1Plan } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { useForkliftTranslation } from '@utils/i18n';

import NameTemplateBody from '../EditNameTemplate/components/NameTemplateBody';
import NameTemplateHelper from '../EditNameTemplate/components/NameTemplateHelper';
import EditNameTemplate from '../EditNameTemplate/EditNameTemplate';

import { pvcNameTemplateAllowedVariables, pvcNameTemplateHelperExamples } from './utils/constants';

export type EditPVCNameTemplateProps = {
  allowInherit?: boolean;
  onConfirmPVCNameTemplate: (options: {
    newValue: string | undefined;
    resource: V1beta1Plan;
  }) => Promise<V1beta1Plan>;
  resource: V1beta1Plan;
  value?: string;
};

const EditPVCNameTemplate: OverlayComponent<EditPVCNameTemplateProps> = ({
  allowInherit = true,
  closeOverlay,
  onConfirmPVCNameTemplate,
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
          allowedVariables={pvcNameTemplateAllowedVariables}
          bodyText={t(
            'PVC name template is a template for generating persistent volume claims (PVC) names for VM disks.',
          )}
        />
      }
      closeOverlay={closeOverlay}
      fieldName={allowInherit ? t('VM PVC name template') : t('Plan PVC name template')}
      helperText={<NameTemplateHelper examples={pvcNameTemplateHelperExamples} />}
      inheritValue={resource?.spec?.pvcNameTemplate}
      onConfirm={async (newValue) => onConfirmPVCNameTemplate({ newValue, resource })}
      title={t('Edit PVC name template')}
      value={value}
      {...rest}
    />
  );
};

export default EditPVCNameTemplate;
