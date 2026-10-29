import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { validateVMTargetName } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/components/utils/utils';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';

import { EditVmWizardStepId } from '../constants';
import type { EditVmWizardFormValues } from '../types';
import { hasNamingTemplatesStepErrors } from '../utils/editVmNamingTemplateValidation';
import { hasInvalidExcludeDiskSelection } from '../utils/hasInvalidExcludeDiskSelection';

type UseEditVmWizardStepValidationArgs = {
  diskLoadError: Error | null;
  isDiskInventoryLoading: boolean;
  plan: V1beta1Plan;
  selectableDiskAddresses: string[];
  vmIndex: number;
};

export const useEditVmWizardStepValidation = ({
  diskLoadError,
  isDiskInventoryLoading,
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
        const vm = getPlanVirtualMachines(plan)[vmIndex];
        return hasInvalidExcludeDiskSelection({
          current: getVmExcludeDisks(vm) ?? [],
          diskLoadError,
          isInventoryLoading: isDiskInventoryLoading,
          selectableAddresses: selectableDiskAddresses,
          selected: values.excludeDisks,
        });
      }

      if (stepId === EditVmWizardStepId.NamingTemplates) {
        return hasNamingTemplatesStepErrors(values);
      }

      return false;
    },
    [diskLoadError, getValues, isDiskInventoryLoading, plan, selectableDiskAddresses, vmIndex],
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
