import type { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { networkNameTemplateAllowedVariables } from 'src/plans/details/tabs/Details/components/SettingsSection/components/NetworkNameTemplate/utils/constants';
import { pvcNameTemplateAllowedVariables } from 'src/plans/details/tabs/Details/components/SettingsSection/components/PVCNameTemplate/utils/constants';
import { volumeNameTemplateAllowedVariables } from 'src/plans/details/tabs/Details/components/SettingsSection/components/VolumeNameTemplate/utils/constants';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import EditVmNameTemplateField from '../components/EditVmNameTemplateField';
import {
  editVmWizardStepDescriptions,
  EditVmWizardStepId,
  editVmWizardStepNames,
} from '../constants';
import { useEditVmWizardContext } from '../EditVmWizardContext';
import type { EditVmWizardFormValues } from '../types';
import { hasNamingTemplatesStepErrors } from '../utils/editVmNamingTemplateValidation';

const EditVmNamingTemplatesStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { plan } = useEditVmWizardContext();
  const { control } = useFormContext<EditVmWizardFormValues>();
  const values = useWatch({ control });
  const hasStepErrors = hasNamingTemplatesStepErrors(values as EditVmWizardFormValues);

  return (
    <WizardStepContainer
      compactTitleDescription
      description={editVmWizardStepDescriptions[EditVmWizardStepId.NamingTemplates]}
      testId="edit-vm-naming-templates-step"
      title={editVmWizardStepNames[EditVmWizardStepId.NamingTemplates]}
    >
      <Stack hasGutter>
        {hasStepErrors && (
          <StackItem>
            <Alert
              isInline
              title={t('Correct the fields below to continue.')}
              variant={AlertVariant.danger}
            />
          </StackItem>
        )}
        <StackItem>
          <EditVmNameTemplateField
            allowedVariables={pvcNameTemplateAllowedVariables}
            description={t('Generate persistent volume claim for VM target disks.')}
            fieldId="pvcNameTemplate"
            inheritValue={plan?.spec?.pvcNameTemplate}
            showDivider
            title={t('PVC name template')}
          />
        </StackItem>
        <StackItem>
          <EditVmNameTemplateField
            allowedVariables={volumeNameTemplateAllowedVariables}
            description={t('Generates volume interface names in the target VM.')}
            fieldId="volumeNameTemplate"
            inheritValue={plan?.spec?.volumeNameTemplate}
            showDivider
            title={t('Volume name template')}
          />
        </StackItem>
        <StackItem>
          <EditVmNameTemplateField
            allowedVariables={networkNameTemplateAllowedVariables}
            description={t('Generates network interface names in the target VM.')}
            fieldId="networkNameTemplate"
            inheritValue={plan?.spec?.networkNameTemplate}
            showDivider={false}
            title={t('Network name template')}
          />
        </StackItem>
      </Stack>
    </WizardStepContainer>
  );
};

export default EditVmNamingTemplatesStep;
