import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ControlledFormGroup from '@components/common/ControlledFormGroup';
import { useProjectNameSelectOptions } from '@components/common/ProjectNameSelect';
import { TypeaheadSelect } from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';

import { GeneralFormFieldId, generalFormFieldLabels } from './constants';

type PlanProjectFieldProps = {
  onSelect: (value: string) => void;
};

export const PlanProjectField: FC<PlanProjectFieldProps> = ({ onSelect }) => {
  const { t } = useForkliftTranslation();
  const {
    formState: { errors },
    setValue,
  } = useCreatePlanFormContext();
  const [targetProject, targetProvider, sourceProvider] = useWatch({
    name: [
      GeneralFormFieldId.PlanProject,
      GeneralFormFieldId.TargetProject,
      GeneralFormFieldId.TargetProvider,
      GeneralFormFieldId.SourceProvider,
    ],
  });
  const [projectOptions] = useProjectNameSelectOptions();

  return (
    <ControlledFormGroup
      isRequired
      fieldId={GeneralFormFieldId.PlanProject}
      label={generalFormFieldLabels[GeneralFormFieldId.PlanProject]}
      controller={{
        render: ({ field }) => (
          <div ref={field.ref}>
            <TypeaheadSelect
              isScrollable
              placeholder={t('Select plan project')}
              id={GeneralFormFieldId.PlanProject}
              selectOptions={projectOptions}
              selected={field.value}
              onSelect={(_, value) => {
                field.onChange(value);
                onSelect(value.toString());

                if (sourceProvider) {
                  setValue(GeneralFormFieldId.SourceProvider, undefined, { shouldValidate: true });
                }
                if (targetProvider) {
                  setValue(GeneralFormFieldId.TargetProvider, undefined, { shouldValidate: true });
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
        ),
        rules: { required: t('Plan project is required.') },
      }}
    />
  );
};

export default PlanProjectField;
