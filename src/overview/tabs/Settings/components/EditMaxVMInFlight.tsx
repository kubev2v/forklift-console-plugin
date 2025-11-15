import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Stack, StackItem } from '@patternfly/react-core';
import { MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS } from '@utils/links';

import { defaultValuesMap } from '../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../utils/types';

import SettingsNumberInput from './SettingsNumberInput';

const EditMaxVMInFlight: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Maximum concurrent VM migrations')}
      labelHelp={
        <HelpIconPopover header={t('Maximum concurrent VM migrations')}>
          <ForkliftTrans>
            <Stack hasGutter>
              <StackItem>
                Sets the maximum number of virtual machines or disks that can be migrated
                simultaneously, varies by the source provider type and by the settings of the
                migration.
              </StackItem>
              <StackItem>The default value is 20 virtual machines or disks.</StackItem>
              <StackItem>
                <a
                  href={MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS}
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn more
                </a>
              </StackItem>
            </Stack>
          </ForkliftTrans>
        </HelpIconPopover>
      }
      helperText={t(
        'Enter the maximum number of concurrent VM migrations. If empty, the default value will be used.',
      )}
    >
      <Controller
        control={control}
        name={SettingsFields.MaxVMInFlight}
        render={({ field: { onChange, value } }) => (
          <SettingsNumberInput
            onChange={onChange}
            value={Number(value)}
            defaultValue={defaultValuesMap[SettingsFields.MaxVMInFlight] as number}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditMaxVMInFlight;
