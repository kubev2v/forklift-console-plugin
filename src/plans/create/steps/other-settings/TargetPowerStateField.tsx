import type { FC } from 'react';
import { Controller } from 'react-hook-form';
import { defaultTargetPowerStateOption, targetPowerStateOptions } from 'src/plans/constants';

import Select from '@components/common/Select';
import { FormGroup, FormHelperText, SelectList, SelectOption, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const TargetPowerStateField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  return (
    <FormGroup
      fieldId={OtherSettingsFormFieldId.TargetPowerState}
      label={otherFormFieldLabels[OtherSettingsFormFieldId.TargetPowerState]}
    >
      <Stack hasGutter>
        <FormHelperText>
          {t(
            "Choose what state you'd like all of the VMs in your plan to be powered to after migration. You can change this setting for specific VMs after plan creation and before starting your migration in the virtual machines tab on the plan page.",
          )}
        </FormHelperText>

        <Controller
          name={OtherSettingsFormFieldId.TargetPowerState}
          control={control}
          render={({ field }) => (
            <Select
              ref={field.ref}
              id={field.name}
              value={field.value?.label}
              testId="target-power-state-select"
              onSelect={(_event, value) => {
                field.onChange(value);
              }}
              placeholder={defaultTargetPowerStateOption.label}
            >
              <SelectList>
                {targetPowerStateOptions.map((option) => (
                  <SelectOption
                    key={option.value}
                    value={option}
                    description={option.description}
                    data-testid={`power-state-option-${option.value}`}
                  >
                    {option.label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          )}
        />
      </Stack>
    </FormGroup>
  );
};

export default TargetPowerStateField;
