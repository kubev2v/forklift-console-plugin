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

import MaxVMInFlightHelpContent from './MaxVMInFlightHelpContent';
const EditMaxVMInFlight: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <Controller
      control={control}
      name={SettingsFields.MaxVMInFlight}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.MaxVMInFlight}
          helperText={t(
            'Enter the maximum number of concurrent VM migrations. If empty, the default value will be used.',
          )}
          helperTextInvalid={error?.message}
          label={t('Maximum concurrent VM migrations')}
          labelHelp={
            <HelpIconPopover header={t('Maximum concurrent VM migrations')}>
              <MaxVMInFlightHelpContent />
            </HelpIconPopover>
          }
          validated={getInputValidated(error)}
        >
          <SettingsNumberInput
            defaultValue={defaultValuesMap[SettingsFields.MaxVMInFlight] as number}
            min={1}
            onBlur={() => {
              onBlur();
              if (error) {
                onChange(defaultValuesMap[SettingsFields.MaxVMInFlight]);
              }
            }}
            onChange={(val) => {
              onChange(Number(val));
            }}
            testId="max-vm-inflight-input"
            validated={getInputValidated(error)}
            value={Number(value)}
          />
        </FormGroupWithHelpText>
      )}
      rules={{ validate: (value) => validateSettingsNumberInput(value, 1) }}
    />
  );
};

export default EditMaxVMInFlight;
