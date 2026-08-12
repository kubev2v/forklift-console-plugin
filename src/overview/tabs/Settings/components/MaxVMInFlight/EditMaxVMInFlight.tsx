import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput';

import MaxVMInFlightHelpContent from './MaxVMInFlightHelpContent';

const EditMaxVMInFlight: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      helperText={t(
        'Enter the maximum number of concurrent VM migrations. If empty, the default value will be used.',
      )}
      label={t('Maximum concurrent VM migrations')}
      labelHelp={
        <HelpIconPopover header={t('Maximum concurrent VM migrations')}>
          <MaxVMInFlightHelpContent />
        </HelpIconPopover>
      }
    >
      <Controller
        control={control}
        name={SettingsFields.MaxVMInFlight}
        render={({ field: { onChange, value } }) => (
          <SettingsNumberInput
            defaultValue={defaultValuesMap[SettingsFields.MaxVMInFlight] as number}
            onChange={(val) => {
              onChange(Number(val));
            }}
            testId="max-vm-inflight-input"
            value={Number(value)}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditMaxVMInFlight;
