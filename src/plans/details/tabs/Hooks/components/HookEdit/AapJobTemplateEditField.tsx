import type { FC } from 'react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { AapConnectionStatus } from 'src/plans/create/steps/migration-hooks/constants';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import { FormGroup, FormHelperText, Label } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { HookEditFormValues } from '../../state/types';
import { HookField } from '../../state/types';

const MAX_MENU_HEIGHT = '200px';
const POPPER_PROPS = { direction: 'up' as const };

type AapJobTemplateEditFieldProps = {
  control: Control<HookEditFormValues>;
  status: AapConnectionStatus;
  templateOptions: TypeaheadSelectOption[];
};

const AapJobTemplateEditField: FC<AapJobTemplateEditFieldProps> = ({
  control,
  status,
  templateOptions,
}) => {
  const { t } = useForkliftTranslation();

  if (!isEmpty(templateOptions)) {
    return (
      <Controller
        control={control}
        name={HookField.AapJobTemplateId}
        render={({ field }) => (
          <FormGroup label={t('Job template')} fieldId={HookField.AapJobTemplateId}>
            <TypeaheadSelect
              options={templateOptions}
              value={field.value}
              onChange={(selected) => {
                field.onChange(
                  selected !== undefined && selected !== '' ? Number(selected) : undefined,
                );
              }}
              allowClear
              placeholder={t('Select a job template...')}
              testId="hook-edit-aap-template-select"
              maxMenuHeight={MAX_MENU_HEIGHT}
              popperProps={POPPER_PROPS}
            />
          </FormGroup>
        )}
      />
    );
  }

  if (status === 'connected') {
    return null;
  }

  return (
    <Controller
      control={control}
      name={HookField.AapJobTemplateId}
      render={({ field: { value } }) => (
        <FormGroup label={t('Job template ID')} fieldId={HookField.AapJobTemplateId}>
          {value ? (
            <>
              <Label data-testid="hook-edit-aap-current-template-id">
                {t('Current: {{id}}', { id: String(value) })}
              </Label>
              <FormHelperText>
                {t('Connect to AAP to browse and change the job template.')}
              </FormHelperText>
            </>
          ) : (
            <FormHelperText>{t('Connect to AAP to select a job template.')}</FormHelperText>
          )}
        </FormGroup>
      )}
    />
  );
};

export default AapJobTemplateEditField;
