import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { validateVMTargetName } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/components/utils/utils';
import { wouldExcludeAllDisks } from 'src/plans/utils/excludeDisks/excludeDiskSelection';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';

import { EditVmWizardStepId } from '../constants';
import type { EditVmWizardFormValues } from '../types';
import { hasNamingTemplatesStepErrors } from '../utils/editVmNamingTemplateValidation';

type UseEditVmWizardStepValidationArgs = {
  plan: V1beta1Plan;
  selectableDiskAddresses: string[];
  vmIndex: number;
};

export const useEditVmWizardStepValidation = ({
  plan,
  selectableDiskAddresses,
  vmIndex,
}: UseEditVmWizardStepValidationArgs): {
  hasStepErrors: (stepId: EditVmWizardStepId) => boolean;
  validateStep: (stepId: EditVmWizardStepId) => Promise<boolean>;
} => {
  const { getValues, trigger } = useFormContext<EditVmWizardFormValues>();

  const hasStepErrors = useCallback(
    (stepId: EditVmWizardStepId): boolean => {
      const values = getValues();
      const otherVms = getPlanVirtualMachines(plan)?.filter((_, index) => index !== vmIndex) ?? [];

      if (stepId === EditVmWizardStepId.General) {
        const nameError = validateVMTargetName(values.targetName, otherVms);
        return Boolean(nameError);
      }

      if (stepId === EditVmWizardStepId.Disks) {
        return wouldExcludeAllDisks(values.excludeDisks, selectableDiskAddresses);
      }

      if (stepId === EditVmWizardStepId.NamingTemplates) {
        return hasNamingTemplatesStepErrors(values);
      }

      return false;
    },
    [getValues, plan, selectableDiskAddresses, vmIndex],
  );

  const validateStep = useCallback(
    async (stepId: EditVmWizardStepId): Promise<boolean> => {
      if (stepId === EditVmWizardStepId.General) {
        return trigger('targetName');
      }

      if (stepId === EditVmWizardStepId.NamingTemplates) {
        return !hasNamingTemplatesStepErrors(getValues());
      }

      return !hasStepErrors(stepId);
    },
    [getValues, hasStepErrors, trigger],
  );

  return { hasStepErrors, validateStep };
};
