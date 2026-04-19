import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { FormGroup, FormHelperText, TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../../hooks/useCreatePlanFormContext';
import { AapFormFieldId } from '../constants';

const NUMERIC_ONLY_PATTERN = /^\d*$/u;

const AapTimeoutField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  return (
    <Controller
      control={control}
      name={AapFormFieldId.AapTimeout}
      render={({ field }) => (
        <FormGroup label={t('Timeout (seconds)')} fieldId={AapFormFieldId.AapTimeout}>
          <TextInput
            id={AapFormFieldId.AapTimeout}
            data-testid="aap-timeout-input"
            value={field.value ?? ''}
            onChange={(_event, val) => {
              if (!NUMERIC_ONLY_PATTERN.test(val)) {
                return;
              }
              field.onChange(val ? Number(val) : undefined);
            }}
          />
          <FormHelperText>
            {t('Timeout for AAP job execution. Defaults to 1 hour if not specified.')}
          </FormHelperText>
        </FormGroup>
      )}
    />
  );
};

export default AapTimeoutField;
