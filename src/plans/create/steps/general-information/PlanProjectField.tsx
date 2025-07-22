import { type FC, useEffect } from 'react';
import { Controller, type FieldPath, type FieldValues, useWatch } from 'react-hook-form';
import useProjectNameSelectOptions from 'src/providers/create/hooks/useProjectNameSelectOptions';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { MenuToggleStatus, Stack, StackItem } from '@patternfly/react-core';
import { useDefaultProject } from '@utils/hooks/useDefaultProject';
import { useForkliftTranslation } from '@utils/i18n';

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
  const [targetProject, targetProvider, sourceProvider] = useWatch({
    control,
    name: [
      GeneralFormFieldId.TargetProject,
      GeneralFormFieldId.TargetProvider,
      GeneralFormFieldId.SourceProvider,
    ],
  });
  const [projectOptions] = useProjectNameSelectOptions();
  const defaultProject = useDefaultProject(projectOptions);

  // Automatically set the default plan project once it's resolved
  useEffect(() => {
    if (defaultProject) {
      setValue(GeneralFormFieldId.PlanProject, defaultProject);
    }
  }, [defaultProject, setValue]);

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={GeneralFormFieldId.PlanProject}
      label={generalFormFieldLabels[GeneralFormFieldId.PlanProject]}
      labelIcon={
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
          <TypeaheadSelect
            ref={field.ref}
            data-testid={testId}
            isScrollable
            allowClear
            placeholder={t('Select plan project')}
            id={GeneralFormFieldId.PlanProject}
            options={projectOptions}
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
