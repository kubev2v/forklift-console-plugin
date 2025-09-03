import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect.tsx';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames.ts';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

type TargetProjectFieldProps = {
  testId?: string;
};

const TargetProjectField: FC<TargetProjectFieldProps> = ({ testId = 'target-project-select' }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useCreatePlanFormContext();
  const [targetProjectNames] = useWatchProjectNames();
  const showDefaultProjects =
    useWatch({ control, name: GeneralFormFieldId.ShowDefaultProjects }) ?? false;

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={GeneralFormFieldId.TargetProject}
      label={generalFormFieldLabels[GeneralFormFieldId.TargetProject]}
      labelIcon={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>
              {t(
                'The target project is the project, within your selected target provider, that your virtual machines will be migrated to. This is different from the project that your migration plan will be created in and where your provider was created.',
              )}
            </StackItem>
            <StackItem>
              {t('Projects, also known as namespaces, separate resources within clusters.')}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        name={GeneralFormFieldId.TargetProject}
        control={control}
        render={({ field }) => (
          <ProjectSelect
            testId={testId}
            placeholder={t('Select target project')}
            id={GeneralFormFieldId.TargetProject}
            projectNames={targetProjectNames}
            value={field.value}
            onChange={field.onChange}
            onNewValue={(newProjectName) => {
              setValue(GeneralFormFieldId.TargetProject, newProjectName);
            }}
            showDefaultProjects={Boolean(showDefaultProjects)}
            setShowDefaultProjects={(value) => {
              setValue(GeneralFormFieldId.ShowDefaultProjects, value);
            }}
            toggleProps={{
              id: 'target-project-select',
              status: errors[GeneralFormFieldId.TargetProject] && MenuToggleStatus.danger,
            }}
          />
        )}
        rules={{ required: t('Target project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default TargetProjectField;
