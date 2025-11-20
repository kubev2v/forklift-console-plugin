import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { snapshotPoolingIntervalOptions } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsSelectInput from '../SettingsSelectInput';

import SnapshotPoolingIntervalHelpContent from './SnapshotPoolingIntervalHelpContent';

const EditSnapshotPoolingInterval: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Snapshot polling interval')}
      labelHelp={
        <HelpIconPopover header={t('Snapshot polling interval')}>
          <SnapshotPoolingIntervalHelpContent />
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
