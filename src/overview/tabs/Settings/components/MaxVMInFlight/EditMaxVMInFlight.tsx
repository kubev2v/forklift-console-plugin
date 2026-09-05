import { type FC, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { getInputValidated } from '@utils/form';

import { defaultValuesMap } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsNumberInput from '../SettingsNumberInput';

import MaxVMInFlightHelpContent from './MaxVMInFlightHelpContent';

const EditMaxVMInFlight: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();
  const [error, setError] = useState<string>();

  return (
    <FormGroupWithHelpText
      helperText={t(
        'Enter the maximum number of concurrent VM migrations. If empty, the default value will be used.',
      )}
      helperTextInvalid={error}
      label={t('Maximum concurrent VM migrations')}
      labelHelp={
        <HelpIconPopover header={t('Maximum concurrent VM migrations')}>
          <MaxVMInFlightHelpContent />
        </HelpIconPopover>
      }
      validated={getInputValidated(error)}
    >
      <Controller
        control={control}
        name={SettingsFields.MaxVMInFlight}
        render={({ field: { onChange, value } }) => (
          <SettingsNumberInput
            defaultValue={defaultValuesMap[SettingsFields.MaxVMInFlight] as number}
            min={1}
            onChange={(val) => {
              onChange(Number(val));
            }}
            onError={setError}
            testId="max-vm-inflight-input"
            validated={getInputValidated(error)}
            value={Number(value)}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditMaxVMInFlight;
