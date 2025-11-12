import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Stack, StackItem } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { controllerMemoryLimitOptions } from '../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../utils/types';

import SettingsSelectInput from './SettingsSelectInput';

const EditControllerMemoryLimit: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Controller main container memory limit')}
      labelHelp={
        <HelpIconPopover header={t('Controller main container memory limit')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Sets the memory limits allocated to the main container in the controller pod. The default value is 800Mi.',
              )}
            </StackItem>
            <StackItem>
              <a href={MTV_SETTINGS} target="_blank" rel="noreferrer">
                Learn more
              </a>
            </StackItem>
          </Stack>
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
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditControllerMemoryLimit;
