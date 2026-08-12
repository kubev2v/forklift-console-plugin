import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput';

import VirtV2vSmpHelpContent from './VirtV2vSmpHelpContent';

const EditVirtV2vSmp: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <Controller
      control={control}
      name={SettingsFields.VirtV2vSmp}
      render={({ field: { onChange, value } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.VirtV2vSmp}
          label={t('Conversion appliance vCPUs')}
          labelHelp={
            <HelpIconPopover header={t('Conversion appliance vCPUs')}>
              <VirtV2vSmpHelpContent />
            </HelpIconPopover>
          }
        >
          <SettingsNumberInput
            defaultValue={Number(defaultValuesMap[SettingsFields.VirtV2vSmp])}
            onChange={(newValue: number | string) => {
              onChange(Math.max(0, Number(newValue)));
            }}
            testId="settings-virt-v2v-smp-input"
            value={value ?? 0}
          />
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default EditVirtV2vSmp;
