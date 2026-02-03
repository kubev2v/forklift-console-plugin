import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { controllerCpuLimitOptions } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsSelectInput from '../SettingsSelectInput';

import ControllerCPULimitHelpContent from './ControllerCPULimitHelpContent';

const EditControllerCPULimit: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Controller main container CPU limit')}
      labelHelp={
        <HelpIconPopover header={t('Controller main container CPU limit')}>
          <ControllerCPULimitHelpContent />
        </HelpIconPopover>
      }
      helperText={t(
        'Enter the limit for CPU usage by the controller in milliCPU. If empty, the default value will be used.',
      )}
    >
      <Controller
        control={control}
        name={SettingsFields.ControllerCPULimit}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            onChange={onChange}
            value={String(value)}
            options={controllerCpuLimitOptions}
            testId="controller-cpu-limit-select"
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditControllerCPULimit;
