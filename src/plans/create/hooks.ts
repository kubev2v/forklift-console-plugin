import { useMemo } from 'react';
import { useForm, useFormContext, type UseFormProps } from 'react-hook-form';

import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ALL_PROJECTS_KEY } from '@utils/constants';
import { getDefaultNamespace } from '@utils/namespaces';

import { GeneralFormFieldId } from './steps/general-information/constants';
import { OtherSettingsFormFieldId } from './steps/other-settings/constants';
import type { CreatePlanFormData } from './types';

export const useDefaultFormValues = (): Partial<CreatePlanFormData> => {
  const [activeNamespace] = useActiveNamespace();
  const defaultNamespace = getDefaultNamespace();
  const [projectOptions] = useProjectNameSelectOptions();
  const initialPlanProject = useMemo(() => {
    const defaultProject =
      activeNamespace === ALL_PROJECTS_KEY ? defaultNamespace : activeNamespace;

    if (projectOptions?.find((option) => option.value === defaultProject)) {
      return defaultProject;
    }

    return '';
  }, [activeNamespace, defaultNamespace, projectOptions]);

  return {
    [GeneralFormFieldId.PlanProject]: initialPlanProject,
    [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: [{ value: '' }],
  };
};

export const useCreatePlanForm = (props: UseFormProps<CreatePlanFormData>) =>
  useForm<CreatePlanFormData>(props);

export const useCreatePlanFormContext = () => useFormContext<CreatePlanFormData>();
