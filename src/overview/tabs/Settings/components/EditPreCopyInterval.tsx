import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Stack, StackItem } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { preCopyIntervalOptions } from '../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../utils/types';

import SettingsSelectInput from './SettingsSelectInput';

const EditPreCopyInterval: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Precopy interval')}
      labelHelp={
        <HelpIconPopover header={t('Precopy interval')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Controls the interval at which a new snapshot is requested prior to initiating a warm migration. The default value is 60 minutes.',
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
        'Enter the interval in minutes for precopy. If empty, the default value will be used.',
      )}
    >
      <Controller
        control={control}
        name={SettingsFields.PrecopyInterval}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            onChange={onChange}
            value={String(value)}
            options={preCopyIntervalOptions}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditPreCopyInterval;
