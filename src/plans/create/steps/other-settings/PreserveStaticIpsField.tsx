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
  const fieldId = OtherSettingsFormFieldId.PreserveStaticIps;
  const label = otherFormFieldLabels[fieldId];

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      labelIcon={
        <HelpIconPopover header={label}>
          {t(
            'By default, vNICs change during migration causing VMs to lose their static IPs. Enable to preserve static IP configurations.',
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
          name={fieldId}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <Checkbox
              id={fieldId}
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
