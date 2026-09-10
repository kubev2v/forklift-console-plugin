import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput/SettingsNumberInput';
import { validateSettingsNumberInput } from '../SettingsNumberInput/utils/validateSettingsNumberInput';

import AapTimeoutHelpContent from './AapTimeoutHelpContent';

const EditAapTimeout: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <Controller
      control={control}
      name={SettingsFields.AapTimeout}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.AapTimeout}
          helperText={t(
            'Enter the timeout in seconds for AAP job template execution. If empty, the default value will be used.',
          )}
          helperTextInvalid={error?.message}
          label={t('AAP timeout (seconds)')}
          labelHelp={
            <HelpIconPopover header={t('AAP timeout')}>
              <AapTimeoutHelpContent />
            </HelpIconPopover>
          }
          validated={getInputValidated(error)}
        >
          <SettingsNumberInput
            defaultValue={Number(defaultValuesMap[SettingsFields.AapTimeout])}
            onBlur={() => {
              onBlur();
              if (error) {
                onChange(defaultValuesMap[SettingsFields.AapTimeout]);
              }
            }}
            onChange={(val) => {
              onChange(Number(val));
            }}
            testId="settings-aap-timeout-input"
            validated={getInputValidated(error)}
            value={value ?? 0}
          />
        </FormGroupWithHelpText>
      )}
      rules={{ validate: (value) => validateSettingsNumberInput(value, 0) }}
    />
  );
};

export default EditAapTimeout;
