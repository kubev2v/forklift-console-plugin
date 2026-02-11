import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { controllerMemoryLimitOptions } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsSelectInput from '../SettingsSelectInput';

import ControllerMemoryLimitHelpContent from './ControllerMemoryLimitHelpContent';

const EditControllerMemoryLimit: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Controller main container memory limit')}
      labelHelp={
        <HelpIconPopover header={t('Controller main container memory limit')}>
          <ControllerMemoryLimitHelpContent />
        </HelpIconPopover>
      }
      helperText={t(
        'Enter the limit for memory usage by the controller in Mi. If empty, the default value will be used.',
      )}
    >
      <Controller
        control={control}
        name={SettingsFields.ControllerMemoryLimit}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            onChange={onChange}
            value={String(value)}
            options={controllerMemoryLimitOptions}
            testId="controller-memory-limit-select"
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditControllerMemoryLimit;
