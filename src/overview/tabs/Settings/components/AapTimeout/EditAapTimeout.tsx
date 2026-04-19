import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput';

import AapTimeoutHelpContent from './AapTimeoutHelpContent';

const EditAapTimeout: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <Controller
      name={SettingsFields.AapTimeout}
      control={control}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          label={t('AAP timeout (seconds)')}
          labelHelp={
            <HelpIconPopover header={t('AAP timeout')}>
              <AapTimeoutHelpContent />
            </HelpIconPopover>
          }
          fieldId={SettingsFields.AapTimeout}
        >
          <SettingsNumberInput
            value={value ?? 0}
            onChange={(newValue: number | string) => {
              onChange(Number(newValue));
            }}
            defaultValue={Number(defaultValuesMap[SettingsFields.AapTimeout])}
            testId="settings-aap-timeout-input"
          />
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default EditAapTimeout;
