import { useForm, type UseFormReturn } from 'react-hook-form';

import type { V1beta1Plan } from '@forklift-ui/types';

import type { EditVmWizardFormValues } from '../types';
import { getDefaultEditVmWizardFormValues } from '../utils/getDefaultEditVmWizardFormValues';

export const useEditVmWizardForm = (
  plan: V1beta1Plan,
  vmIndex: number,
): UseFormReturn<EditVmWizardFormValues> =>
  useForm<EditVmWizardFormValues>({
    defaultValues: getDefaultEditVmWizardFormValues(plan, vmIndex),
    mode: 'onChange',
  });
