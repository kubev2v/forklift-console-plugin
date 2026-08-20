import type { FC } from 'react';
import { type ControllerRenderProps, useWatch } from 'react-hook-form';

import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';
import { isProviderLocalOpenshift } from '@utils/resources';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import type { CreatePlanFormData } from '../../types';

import { GeneralFormFieldId } from './constants';
import TargetProjectEmptyState from './TargetProjectEmptyState';

type TargetProjectSelectProps = {
  error?: Error | null;
  field: ControllerRenderProps<CreatePlanFormData, GeneralFormFieldId.TargetProject>;
  loaded?: boolean;
  targetProjectNames: string[];
  testId?: string;
};

const TargetProjectSelect: FC<TargetProjectSelectProps> = ({
  error,
  field,
  loaded,
  targetProjectNames,
  testId,
}) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useCreatePlanFormContext();
  const targetProvider = useWatch({
    control,
    name: GeneralFormFieldId.TargetProvider,
  });
  const targetProviderName = getName(targetProvider);
  const isLocalOpenshift = isProviderLocalOpenshift(targetProvider);

  const showDefaultProjects =
    useWatch({ control, name: GeneralFormFieldId.ShowDefaultProjects }) ?? false;

  return (
    <ProjectSelect
      emptyStateMessage={
        targetProviderName ? (
          <TargetProjectEmptyState error={error} targetProviderName={targetProviderName} />
        ) : null
      }
      errorLoading={error}
      id={GeneralFormFieldId.TargetProject}
      isDisabled={!targetProvider}
      loading={!loaded}
      noOptionsMessage={
        targetProvider ? undefined : t('Select a target provider to list available target projects')
      }
      onChange={field.onChange}
      onNewValue={
        isLocalOpenshift
          ? (newProjectName): void => {
              field.onChange(newProjectName);
            }
          : undefined
      }
      placeholder={
        targetProvider
          ? t('Select target project')
          : t('Must choose a target provider to see available target projects')
      }
      projectNames={targetProjectNames}
      setShowDefaultProjects={(value) => {
        setValue(GeneralFormFieldId.ShowDefaultProjects, value);
      }}
      showDefaultProjects={showDefaultProjects}
      testId={testId}
      toggleProps={{
        id: 'target-project-select',
        status: errors[GeneralFormFieldId.TargetProject] && MenuToggleStatus.danger,
      }}
      value={field.value}
    />
  );
};

export default TargetProjectSelect;
