import { useMemo } from 'react';
import { useForm, useFormContext, type UseFormProps, useWatch } from 'react-hook-form';

import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { ALL_PROJECTS_KEY } from '@utils/constants';
import { getDefaultNamespace } from '@utils/namespaces';

import { GeneralFormFieldId } from './steps/general-information/constants';
import type { CreatePlanFormValues } from './constants';

export const useDefaultFormValues = (): CreatePlanFormValues => {
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
    [GeneralFormFieldId.PlanName]: '',
    [GeneralFormFieldId.PlanProject]: initialPlanProject,
    [GeneralFormFieldId.SourceProvider]: undefined,
    [GeneralFormFieldId.TargetProject]: '',
    [GeneralFormFieldId.TargetProvider]: undefined,
  };
};

export const useCreatePlanForm = (props: UseFormProps<CreatePlanFormValues>) =>
  useForm<CreatePlanFormValues>(props);

export const useCreatePlanFormContext = () => useFormContext<CreatePlanFormValues>();

export const useCreatePlanFieldWatch = <T extends keyof CreatePlanFormValues>(fieldId: T) =>
  useWatch<CreatePlanFormValues, T>({ name: fieldId });
