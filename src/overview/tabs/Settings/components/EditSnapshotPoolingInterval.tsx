import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Stack, StackItem } from '@patternfly/react-core';
import { MTV_SETTINGS } from '@utils/links';

import { snapshotPoolingIntervalOptions } from '../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../utils/types';

import SettingsSelectInput from './SettingsSelectInput';

const EditSnapshotPoolingInterval: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Snapshot polling interval')}
      labelHelp={
        <HelpIconPopover header={t('Snapshot polling interval')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'Determines the frequency with which the system checks the status of snapshot creation or removal during oVirt warm migration. The default value is 10 seconds.',
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
        'Enter the interval in seconds for snapshot pooling. If empty, the default value will be used.',
      )}
    >
      <Controller
        control={control}
        name={SettingsFields.SnapshotStatusCheckRate}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            onChange={onChange}
            value={String(value)}
            options={snapshotPoolingIntervalOptions}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditSnapshotPoolingInterval;
