import { type FC, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput';

import AapTimeoutHelpContent from './AapTimeoutHelpContent';

const EditAapTimeout: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();
  const [error, setError] = useState<string>();

  return (
    <Controller
      control={control}
      name={SettingsFields.AapTimeout}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.AapTimeout}
          helperTextInvalid={error}
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
            onChange={(newValue: number | string) => {
              onChange(Math.max(0, Number(newValue)));
            }}
            onError={setError}
            testId="settings-aap-timeout-input"
            validated={getInputValidated(error)}
            value={value ?? 0}
          />
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default EditAapTimeout;
