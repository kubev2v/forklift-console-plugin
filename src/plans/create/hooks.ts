import { Namespace } from '@utils/constants';
import { GeneralFormFieldId } from './steps/general-information/constants';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { getDefaultNamespace } from '@utils/namespaces';
import { CreatePlanFormValues } from './constants';
import { useForm, useFormContext, UseFormProps, useWatch } from 'react-hook-form';
import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { useMemo } from 'react';

export const useDefaultFormValues = (): CreatePlanFormValues => {
  const [activeNamespace] = useActiveNamespace();
  const defaultNamespace = getDefaultNamespace();
  const [projectOptions] = useProjectNameSelectOptions();
  const initialPlanProject = useMemo(() => {
    const defaultProject =
      activeNamespace === Namespace.AllProjects ? defaultNamespace : activeNamespace;

    if (projectOptions?.find((option) => option.value === defaultProject)) {
      return defaultProject;
    }

    return '';
  }, []);

  return {
    [GeneralFormFieldId.PlanName]: '',
    [GeneralFormFieldId.PlanProject]: initialPlanProject,
    [GeneralFormFieldId.SourceProvider]: undefined,
    [GeneralFormFieldId.TargetProvider]: undefined,
    [GeneralFormFieldId.TargetProject]: '',
  };
};

export const useCreatePlanForm = (props: UseFormProps<CreatePlanFormValues>) =>
  useForm<CreatePlanFormValues>(props);

export const useCreatePlanFormContext = () => useFormContext<CreatePlanFormValues>();

export const useCreatePlanFieldWatch = <T extends keyof CreatePlanFormValues>(fieldId: T) =>
  useWatch<CreatePlanFormValues, T>({ name: fieldId });
