import { useContext, useMemo } from 'react';
import { useForm, useFormContext, type UseFormProps } from 'react-hook-form';

import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ALL_PROJECTS_KEY } from '@utils/constants';
import { getDefaultNamespace } from '@utils/namespaces';

import { GeneralFormFieldId } from './steps/general-information/constants';
import { OtherSettingsFormFieldId } from './steps/other-settings/constants';
import { VmFormFieldId } from './steps/virtual-machines/constants';
import { CreatePlanWizardContext } from './constants';
import type { CreatePlanFormData, CreatePlanWizardContextProps } from './types';

/**
 * Hook to generate default form values for the migration plan creation form
 * Determines the initial project/namespace and sets up empty disk decryption fields
 */
export const useDefaultFormValues = (): Partial<CreatePlanFormData> => {
  const [activeNamespace] = useActiveNamespace();
  const defaultNamespace = getDefaultNamespace();
  const [projectOptions] = useProjectNameSelectOptions();

  // Determine the initial project by checking active namespace against available options
  const initialPlanProject = useMemo(() => {
    // If we're in "All Projects" view, use the default namespace
    // Otherwise use the currently active namespace
    const defaultProject =
      activeNamespace === ALL_PROJECTS_KEY ? defaultNamespace : activeNamespace;

    // Only set the default project if it exists in available options
    if (projectOptions?.find((option) => option.value === defaultProject)) {
      return defaultProject;
    }

    return '';
  }, [activeNamespace, defaultNamespace, projectOptions]);

  return {
    [GeneralFormFieldId.PlanProject]: initialPlanProject,
    [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: [{ value: '' }],
    [VmFormFieldId.Vms]: {},
  };
};

/**
 * Custom wrapper around react-hook-form's useForm hook
 * Provides typed form handling for the migration plan creation form
 */
export const useCreatePlanForm = (props: UseFormProps<CreatePlanFormData>) =>
  useForm<CreatePlanFormData>(props);

/**
 * Custom wrapper around react-hook-form's useFormContext hook
 * Provides typed access to form context for the migration plan creation form
 */
export const useCreatePlanFormContext = () => useFormContext<CreatePlanFormData>();

/**
 * Hook to access the CreatePlanWizard context
 * @returns Context containing network data for source and target providers
 */
export const useCreatePlanWizardContext = (): CreatePlanWizardContextProps =>
  useContext(CreatePlanWizardContext);
