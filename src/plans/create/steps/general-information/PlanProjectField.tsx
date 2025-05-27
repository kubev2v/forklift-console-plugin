import type { FC } from 'react';
import { Controller, type FieldPath, type FieldValues, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { TypeaheadSelect } from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

const PlanProjectField: FC = () => {
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

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={GeneralFormFieldId.PlanProject}
      label={generalFormFieldLabels[GeneralFormFieldId.PlanProject]}
    >
      <Controller
        name={GeneralFormFieldId.PlanProject}
        control={control}
        render={({ field }) => (
          <div ref={field.ref}>
            <TypeaheadSelect
              isScrollable
              placeholder={t('Select plan project')}
              id={GeneralFormFieldId.PlanProject}
              selectOptions={projectOptions}
              selected={field.value}
              onSelect={(_, value) => {
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
              onClearSelection={() => {
                field.onChange('');
              }}
              toggleProps={{
                status: errors[GeneralFormFieldId.PlanProject] && MenuToggleStatus.danger,
              }}
            />
          </div>
        )}
        rules={{ required: t('Plan project is required.') }}
      />
    </FormGroupWithErrorText>
  );
};

export default PlanProjectField;
