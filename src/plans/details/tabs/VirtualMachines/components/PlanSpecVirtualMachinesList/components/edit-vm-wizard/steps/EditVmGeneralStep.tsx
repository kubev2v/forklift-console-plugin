import { type FC, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { getTargetPowerStateLabel, NO_INSTANCE_TYPE } from 'src/plans/constants';
import TargetPowerStateDropdown from 'src/plans/details/tabs/Details/components/SettingsSection/components/TargetPowerState/TargetPowerStateDropdown';
import { validateVMTargetName } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/components/utils/utils';
import { useInstanceTypeOptions } from 'src/plans/hooks/useInstanceTypeOptions';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form, Stack, StackItem, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { getPlanTargetPowerState, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import {
  editVmWizardStepDescriptions,
  EditVmWizardStepId,
  editVmWizardStepNames,
} from '../constants';
import { useEditVmWizardContext } from '../EditVmWizardContext';
import type { EditVmWizardFormValues } from '../types';

const EditVmGeneralStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<EditVmWizardFormValues>();
  const { plan, vmIndex } = useEditVmWizardContext();
  const vm = getPlanVirtualMachines(plan)[vmIndex];
  const vmSourceName = vm?.name ?? t('selected');
  const otherVms = getPlanVirtualMachines(plan)?.filter((_, index) => index !== vmIndex) ?? [];
  const { loaded, options } = useInstanceTypeOptions();
  const planTargetPowerState = getPlanTargetPowerState(plan);
  const instanceType = useWatch({ control, name: 'instanceType' });

  const instanceTypeHelperText = useMemo((): string => {
    const selectedValue = instanceType ?? NO_INSTANCE_TYPE;
    const selectedOption = options.find((option) => option.value === selectedValue);
    const description = selectedOption?.optionProps?.description;
    return typeof description === 'string' ? description : '';
  }, [instanceType, options]);

  const planPowerStateHelperText = t('Plan setting: {{value}}', {
    value: getTargetPowerStateLabel(planTargetPowerState),
  });

  const instanceTypeOptions = useMemo(
    () =>
      loaded
        ? options
        : [
            {
              content: t('None'),
              optionProps: { description: t("Keep the VM's original CPU and memory") },
              value: NO_INSTANCE_TYPE,
            },
          ],
    [loaded, options, t],
  );

  return (
    <WizardStepContainer
      compactTitleDescription
      description={editVmWizardStepDescriptions[EditVmWizardStepId.General]}
      testId="edit-vm-general-step"
      title={editVmWizardStepNames[EditVmWizardStepId.General]}
    >
      <Form>
        <Stack hasGutter>
          <StackItem>
            <Controller
              control={control}
              name="targetName"
              render={({ field, fieldState }) => {
                const validated = fieldState.error
                  ? ValidatedOptions.error
                  : ValidatedOptions.default;

                return (
                  <FormGroupWithHelpText
                    helperText={t("The VM's name after migration. Source name: {{vmSourceName}}", {
                      vmSourceName,
                    })}
                    helperTextInvalid={fieldState.error?.message}
                    label={t('VM target name')}
                    validated={validated}
                  >
                    <TextInput
                      data-testid="vm-target-name-input"
                      onBlur={field.onBlur}
                      onChange={(_event, val) => {
                        field.onChange(val);
                      }}
                      validated={validated}
                      value={field.value}
                    />
                  </FormGroupWithHelpText>
                );
              }}
              rules={{
                validate: (value) => validateVMTargetName(value, otherVms) ?? true,
              }}
            />
          </StackItem>
          <StackItem>
            <FormGroupWithHelpText
              helperText={planPowerStateHelperText}
              label={t('VM target power state')}
            >
              <Controller
                control={control}
                name="targetPowerState"
                render={({ field: { onChange, value } }) => (
                  <TargetPowerStateDropdown
                    allowInherit
                    onChange={onChange}
                    planState={planTargetPowerState}
                    value={value}
                  />
                )}
              />
            </FormGroupWithHelpText>
          </StackItem>
          <StackItem>
            <FormGroupWithHelpText helperText={instanceTypeHelperText} label={t('Instance type')}>
              <Controller
                control={control}
                name="instanceType"
                render={({ field: { onChange, value } }) => (
                  <TypeaheadSelect
                    allowClear
                    id="edit-vm-instance-type"
                    isDisabled={!loaded}
                    onChange={(selected) => {
                      onChange(
                        selected === undefined || selected === NO_INSTANCE_TYPE
                          ? undefined
                          : String(selected),
                      );
                    }}
                    options={instanceTypeOptions}
                    placeholder={t('None')}
                    testId="instance-type-select"
                    value={value ?? NO_INSTANCE_TYPE}
                  />
                )}
              />
            </FormGroupWithHelpText>
          </StackItem>
        </Stack>
      </Form>
    </WizardStepContainer>
  );
};

export default EditVmGeneralStep;
