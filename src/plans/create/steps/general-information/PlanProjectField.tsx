import { type FC, useEffect, useRef } from 'react';
import { Controller, type FieldPath, type FieldValues, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ProjectSelect from '@components/common/ProjectSelect/ProjectSelect.tsx';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames.ts';
import { useForkliftTranslation } from '@utils/i18n';
import { isSystemNamespace } from '@utils/namespaces.ts';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

type PlanProjectFieldProps = {
  testId?: string;
};

const PlanProjectField: FC<PlanProjectFieldProps> = ({ testId = 'plan-project-select' }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { errors },
    setValue,
  } = useCreatePlanFormContext();

  const [projectNames] = useWatchProjectNames();

  const hasProjects = !isEmpty(projectNames);
  const defaultProject = useDefaultProject(projectNames);
  const hasSetInitialDefault = useRef(false);
  const showDefaultProjects =
    useWatch({ control, name: GeneralFormFieldId.ShowDefaultProjects }) ?? false;

  const [planProject, sourceProvider, targetProvider, targetProject] = useWatch({
    control,
    name: [
      GeneralFormFieldId.PlanProject,
      GeneralFormFieldId.SourceProvider,
      GeneralFormFieldId.TargetProvider,
      GeneralFormFieldId.TargetProject,
    ],
  });

  useEffect(() => {
    if (defaultProject && hasProjects && !hasSetInitialDefault.current && isEmpty(planProject)) {
      setValue(GeneralFormFieldId.PlanProject, defaultProject);
      setValue(GeneralFormFieldId.ShowDefaultProjects, isSystemNamespace(defaultProject));

      hasSetInitialDefault.current = true;
    }
  }, [defaultProject, setValue, planProject, hasProjects]);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={GeneralFormFieldId.PlanProject}
      label={generalFormFieldLabels[GeneralFormFieldId.PlanProject]}
      labelHelp={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>
              {t(
                'The project that your migration plan will be created in. Only projects with providers in them can be selected.',
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
        name={GeneralFormFieldId.PlanProject}
        control={control}
        render={({ field }) => (
          <ProjectSelect
            testId={testId}
            showDefaultProjects={showDefaultProjects}
            setShowDefaultProjects={(value) => {
              setValue(GeneralFormFieldId.ShowDefaultProjects, value);
            }}
            placeholder={t('Select plan project')}
            id={GeneralFormFieldId.PlanProject}
            projectNames={projectNames}
            value={field.value}
            onChange={(value) => {
              field.onChange(value);

              if (sourceProvider) {
                setValue<FieldPath<FieldValues>>(GeneralFormFieldId.SourceProvider, '', {
                  shouldValidate: true,
                });
              }
              if (targetProvider) {
                setValue<FieldPath<FieldValues>>(GeneralFormFieldId.TargetProvider, '', {
                  shouldValidate: true,
                });
              }
              if (targetProject) {
                setValue(GeneralFormFieldId.TargetProject, '', { shouldValidate: true });
              }
            }}
            toggleProps={{
              id: 'plan-project-select',
              status: errors[GeneralFormFieldId.PlanProject] && MenuToggleStatus.danger,
            }}
          />
        )}
        rules={{ required: t('Plan project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default PlanProjectField;
