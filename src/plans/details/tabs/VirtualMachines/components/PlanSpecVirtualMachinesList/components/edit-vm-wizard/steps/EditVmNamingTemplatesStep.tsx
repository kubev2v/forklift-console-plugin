import type { FC } from 'react';
import { networkNameTemplateAllowedVariables } from 'src/plans/details/tabs/Details/components/SettingsSection/components/NetworkNameTemplate/utils/constants';
import { pvcNameTemplateAllowedVariables } from 'src/plans/details/tabs/Details/components/SettingsSection/components/PVCNameTemplate/utils/constants';
import { volumeNameTemplateAllowedVariables } from 'src/plans/details/tabs/Details/components/SettingsSection/components/VolumeNameTemplate/utils/constants';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import EditVmNameTemplateField from '../components/EditVmNameTemplateField';
import {
  editVmWizardStepDescriptions,
  EditVmWizardStepId,
  editVmWizardStepNames,
} from '../constants';
import { useEditVmWizardContext } from '../EditVmWizardContext';

const EditVmNamingTemplatesStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { plan } = useEditVmWizardContext();

  return (
    <WizardStepContainer
      compactTitleDescription
      description={editVmWizardStepDescriptions[EditVmWizardStepId.NamingTemplates]}
      testId="edit-vm-naming-templates-step"
      title={editVmWizardStepNames[EditVmWizardStepId.NamingTemplates]}
    >
      <Stack hasGutter>
        <StackItem>
          <EditVmNameTemplateField
            allowedVariables={pvcNameTemplateAllowedVariables}
            description={t('Generates persistent volume claim names for VM target disks.')}
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
