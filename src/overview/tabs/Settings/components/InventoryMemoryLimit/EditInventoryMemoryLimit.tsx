import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import { inventoryMemoryLimitOptions } from '../../utils/constants';
import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsSelectInput from '../SettingsSelectInput';

import InventoryMemoryLimitHelpContent from './InventoryMemoryLimitHelpContent';

const EditInventoryMemoryLimit: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('Controller inventory container memory limit')}
      labelHelp={
        <HelpIconPopover header={t('Controller inventory container memory limit')}>
          <InventoryMemoryLimitHelpContent />
        </HelpIconPopover>
      }
      helperText={t(
        'Enter the limit for memory usage by the inventory container in Mi. If empty, the default value will be used.',
      )}
    >
      <Controller
        control={control}
        name={SettingsFields.InventoryMemoryLimit}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            onChange={onChange}
            value={String(value)}
            options={inventoryMemoryLimitOptions}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditInventoryMemoryLimit;
