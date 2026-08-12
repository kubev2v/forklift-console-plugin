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
      control={control}
      name={SettingsFields.AapTimeout}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.AapTimeout}
          label={t('AAP timeout (seconds)')}
          labelHelp={
            <HelpIconPopover header={t('AAP timeout')}>
              <AapTimeoutHelpContent />
            </HelpIconPopover>
          }
        >
          <SettingsNumberInput
            defaultValue={Number(defaultValuesMap[SettingsFields.AapTimeout])}
            onChange={(newValue: number | string) => {
              onChange(Math.max(0, Number(newValue)));
            }}
            testId="settings-aap-timeout-input"
            value={value ?? 0}
          />
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default EditAapTimeout;
