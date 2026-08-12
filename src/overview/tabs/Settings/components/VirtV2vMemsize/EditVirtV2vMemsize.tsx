import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput';

import VirtV2vMemsizeHelpContent from './VirtV2vMemsizeHelpContent';

const EditVirtV2vMemsize: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <Controller
      control={control}
      name={SettingsFields.VirtV2vMemsize}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.VirtV2vMemsize}
          label={t('Conversion appliance memory (MB)')}
          labelHelp={
            <HelpIconPopover header={t('Conversion appliance memory')}>
              <VirtV2vMemsizeHelpContent />
            </HelpIconPopover>
          }
        >
          <SettingsNumberInput
            defaultValue={Number(defaultValuesMap[SettingsFields.VirtV2vMemsize])}
            onChange={(newValue: number | string) => {
              onChange(Math.max(0, Number(newValue)));
            }}
            testId="settings-virt-v2v-memsize-input"
            value={value ?? 0}
          />
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default EditVirtV2vMemsize;
