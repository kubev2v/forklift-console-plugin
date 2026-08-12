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
      helperText={t(
        'Enter the limit for memory usage by the inventory container in Mi. If empty, the default value will be used.',
      )}
      label={t('Controller inventory container memory limit')}
      labelHelp={
        <HelpIconPopover header={t('Controller inventory container memory limit')}>
          <InventoryMemoryLimitHelpContent />
        </HelpIconPopover>
      }
    >
      <Controller
        control={control}
        name={SettingsFields.InventoryMemoryLimit}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            onChange={onChange}
            options={inventoryMemoryLimitOptions}
            testId="inventory-memory-limit-select"
            value={String(value)}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditInventoryMemoryLimit;
