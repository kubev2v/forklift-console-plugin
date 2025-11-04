import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Checkbox, FormGroup, FormHelperText, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const PreserveStaticIpsField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const label = otherFormFieldLabels[OtherSettingsFormFieldId.PreserveStaticIps];

  return (
    <FormGroup
      fieldId={OtherSettingsFormFieldId.PreserveStaticIps}
      label={label}
      labelHelp={
        <HelpIconPopover header={label}>
          {t(
            'By default, vNICs change during migration and static IPs linked to interface names are lost. Enable to preserve static IP configurations.',
          )}
        </HelpIconPopover>
      }
      className="checkbox-form-group"
    >
      <Stack hasGutter>
        <FormHelperText>
          {t('Use when VMs have static IPs that must remain unchanged after migration.')}
        </FormHelperText>

        <Controller
          name={OtherSettingsFormFieldId.PreserveStaticIps}
          control={control}
          defaultValue={true}
          render={({ field }) => (
            <Checkbox
              id={OtherSettingsFormFieldId.PreserveStaticIps}
              label={label}
              isChecked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Stack>
    </FormGroup>
  );
};

export default PreserveStaticIpsField;
