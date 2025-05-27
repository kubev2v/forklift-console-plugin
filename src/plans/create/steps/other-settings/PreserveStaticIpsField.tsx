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
            'By default, the static IPs of VMs with Windows guest Operating system from vSphere is set to preserve.',
          )}
        </HelpIconPopover>
      }
      className="checkbox-form-group"
    >
      <Stack hasGutter>
        <FormHelperText>
          {t(
            'Do not try to preserve the static IPs of VMs with Windows guest operating system from vSphere.',
          )}
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
