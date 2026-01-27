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
  testId?: string;
  loaded?: boolean;
  error?: Error | null;
  targetProjectNames: string[];
  field: ControllerRenderProps<CreatePlanFormData, GeneralFormFieldId.TargetProject>;
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
      testId={testId}
      isDisabled={!targetProvider}
      loading={!loaded}
      placeholder={
        targetProvider
          ? t('Select target project')
          : t('Must choose a target provider to see available target projects')
      }
      id={GeneralFormFieldId.TargetProject}
      projectNames={targetProjectNames}
      emptyStateMessage={
        targetProviderName ? (
          <TargetProjectEmptyState targetProviderName={targetProviderName} error={error} />
        ) : null
      }
      value={field.value}
      onChange={field.onChange}
      onNewValue={
        isLocalOpenshift
          ? (newProjectName) => {
              field.onChange(newProjectName);
            }
          : undefined
      }
      showDefaultProjects={showDefaultProjects}
      setShowDefaultProjects={(value) => {
        setValue(GeneralFormFieldId.ShowDefaultProjects, value);
      }}
      noOptionsMessage={
        targetProvider ? undefined : t('Select a target provider to list available target projects')
      }
      toggleProps={{
        id: 'target-project-select',
        status: errors[GeneralFormFieldId.TargetProject] && MenuToggleStatus.danger,
      }}
      errorLoading={error}
    />
  );
};

export default TargetProjectSelect;
