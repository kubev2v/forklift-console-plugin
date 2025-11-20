import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { preCopyIntervalOptions } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsSelectInput from '../SettingsSelectInput';

import PreCopyIntervalHelpContent from './PreCopyIntervalHelpContent';

const EditPreCopyInterval: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Precopy interval')}
      labelHelp={
        <HelpIconPopover header={t('Precopy interval')}>
          <PreCopyIntervalHelpContent />
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
