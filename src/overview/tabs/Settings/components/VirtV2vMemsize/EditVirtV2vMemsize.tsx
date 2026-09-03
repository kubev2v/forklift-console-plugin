import { type FC, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput';

import VirtV2vMemsizeHelpContent from './VirtV2vMemsizeHelpContent';

const EditVirtV2vMemsize: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();
  const [error, setError] = useState<string>();

  return (
    <Controller
      control={control}
      name={SettingsFields.VirtV2vMemsize}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.VirtV2vMemsize}
          helperTextInvalid={error}
          label={t('Conversion appliance memory (MB)')}
          labelHelp={
            <HelpIconPopover header={t('Conversion appliance memory')}>
              <VirtV2vMemsizeHelpContent />
            </HelpIconPopover>
          }
          validated={getInputValidated(error)}
        >
          <SettingsNumberInput
            defaultValue={Number(defaultValuesMap[SettingsFields.VirtV2vMemsize])}
            onChange={(newValue: number | string) => {
              onChange(Math.max(0, Number(newValue)));
            }}
            onError={setError}
            testId="settings-virt-v2v-memsize-input"
            validated={getInputValidated(error)}
            value={value ?? 0}
          />
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default EditVirtV2vMemsize;
