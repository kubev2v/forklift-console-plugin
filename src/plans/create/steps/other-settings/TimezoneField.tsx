import { type FC, useMemo } from 'react';
import { Controller } from 'react-hook-form';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { FormGroup, FormHelperText, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const TimezoneField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const timezoneOptions = useMemo(
    () =>
      Intl.supportedValuesOf('timeZone').map((tz) => ({
        content: tz,
        value: tz,
      })),
    [],
  );

  return (
    <FormGroup
      fieldId={OtherSettingsFormFieldId.Timezone}
      label={otherFormFieldLabels[OtherSettingsFormFieldId.Timezone]}
    >
      <Stack hasGutter>
        <FormHelperText>
          {t(
            'Set the timezone for all VMs in this plan. When set, this overrides any timezone detected from the source provider. Leave empty to use the source provider default.',
          )}
        </FormHelperText>

        <Controller
          name={OtherSettingsFormFieldId.Timezone}
          control={control}
          render={({ field }) => (
            <TypeaheadSelect
              ref={field.ref}
              options={timezoneOptions}
              value={field.value || undefined}
              onChange={(value) => {
                field.onChange(value ?? '');
              }}
              allowClear
              placeholder={t('Use source provider default')}
              testId="timezone-select"
            />
          )}
        />
      </Stack>
    </FormGroup>
  );
};

export default TimezoneField;
