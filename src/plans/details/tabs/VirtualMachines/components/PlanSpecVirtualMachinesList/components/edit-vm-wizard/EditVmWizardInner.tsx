import type { FC } from 'react';

import { Wizard, WizardStep } from '@patternfly/react-core';

import { useEditVmWizardSteps } from './hooks/useEditVmWizardSteps';
import EditVmDisksStep from './steps/EditVmDisksStep';
import EditVmGeneralStep from './steps/EditVmGeneralStep';
import EditVmNamingTemplatesStep from './steps/EditVmNamingTemplatesStep';
import EditVmReviewStep from './steps/EditVmReviewStep';
import { EditVmWizardStepId, editVmWizardStepNames } from './constants';
import { useEditVmWizardContext } from './EditVmWizardContext';
import EditVmWizardFooter from './EditVmWizardFooter';

type EditVmWizardInnerProps = {
  closeOverlay: () => void;
};

const stepComponents: Record<EditVmWizardStepId, FC> = {
  [EditVmWizardStepId.Disks]: EditVmDisksStep,
  [EditVmWizardStepId.General]: EditVmGeneralStep,
  [EditVmWizardStepId.NamingTemplates]: EditVmNamingTemplatesStep,
  [EditVmWizardStepId.Review]: EditVmReviewStep,
};

const EditVmWizardInner: FC<EditVmWizardInnerProps> = ({ closeOverlay }) => {
  const { providerType } = useEditVmWizardContext();
  const stepIds = useEditVmWizardSteps(providerType);

  return (
    <Wizard
      className="edit-vm-wizard"
      data-testid="edit-vm-wizard"
      footer={<EditVmWizardFooter closeOverlay={closeOverlay} />}
      height={560}
      nav={{ isExpanded: true }}
    >
      {stepIds.map((stepId) => {
        const StepComponent = stepComponents[stepId];
        return (
          <WizardStep id={stepId} key={stepId} name={editVmWizardStepNames[stepId]}>
            <StepComponent />
          </WizardStep>
        );
      })}
    </Wizard>
  );
};

export default EditVmWizardInner;
