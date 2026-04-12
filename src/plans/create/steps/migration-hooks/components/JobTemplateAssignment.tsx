import { type FC, useMemo } from 'react';
import { Controller } from 'react-hook-form';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import { FormGroup, FormSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import { useCreatePlanFormContext } from '../../../hooks/useCreatePlanFormContext';
import { AapFormFieldId } from '../constants';

const MAX_MENU_HEIGHT = '200px';
const POPPER_PROPS = { direction: 'up' as const };

type JobTemplateAssignmentProps = {
  jobTemplates: AapJobTemplate[];
};

const toSelectOptions = (templates: AapJobTemplate[]): TypeaheadSelectOption[] =>
  templates.map((template) => ({
    content: template.name,
    optionProps: { description: template.description },
    value: template.id,
  }));

const JobTemplateAssignment: FC<JobTemplateAssignmentProps> = ({ jobTemplates }) => {
  const { t } = useForkliftTranslation();
  const { control, watch } = useCreatePlanFormContext();

  const preHookId = watch(AapFormFieldId.AapPreHookJobTemplateId);
  const postHookId = watch(AapFormFieldId.AapPostHookJobTemplateId);

  const preHookOptions = useMemo(
    () => toSelectOptions(jobTemplates.filter((tpl) => tpl.id !== postHookId)),
    [jobTemplates, postHookId],
  );

  const postHookOptions = useMemo(
    () => toSelectOptions(jobTemplates.filter((tpl) => tpl.id !== preHookId)),
    [jobTemplates, preHookId],
  );

  return (
    <FormSection title={t('Assign Job Templates')}>
      <p className="pf-v6-u-font-size-sm pf-v6-u-color-200">
        {t(
          'Select a job template for pre-migration and/or post-migration. Each template can only be assigned to one hook.',
        )}
      </p>

      <Controller
        control={control}
        name={AapFormFieldId.AapPreHookJobTemplateId}
        render={({ field }) => (
          <FormGroup
            label={t('Pre-migration hook job template')}
            fieldId={AapFormFieldId.AapPreHookJobTemplateId}
          >
            <TypeaheadSelect
              options={preHookOptions}
              value={field.value}
              onChange={(selected) => {
                const numericValue =
                  selected !== undefined && selected !== '' ? Number(selected) : undefined;
                field.onChange(numericValue);
              }}
              allowClear
              placeholder={t('Select a job template...')}
              testId="aap-pre-hook-template-select"
              maxMenuHeight={MAX_MENU_HEIGHT}
              popperProps={POPPER_PROPS}
            />
          </FormGroup>
        )}
      />

      <Controller
        control={control}
        name={AapFormFieldId.AapPostHookJobTemplateId}
        render={({ field }) => (
          <FormGroup
            label={t('Post-migration hook job template')}
            fieldId={AapFormFieldId.AapPostHookJobTemplateId}
          >
            <TypeaheadSelect
              options={postHookOptions}
              value={field.value}
              onChange={(selected) => {
                const numericValue =
                  selected !== undefined && selected !== '' ? Number(selected) : undefined;
                field.onChange(numericValue);
              }}
              allowClear
              placeholder={t('Select a job template...')}
              testId="aap-post-hook-template-select"
              maxMenuHeight={MAX_MENU_HEIGHT}
              popperProps={POPPER_PROPS}
            />
          </FormGroup>
        )}
      />
    </FormSection>
  );
};

export default JobTemplateAssignment;
