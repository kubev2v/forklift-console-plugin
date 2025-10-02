import { type FC, useState } from 'react';
import type { EnhancedPlanSpecVms } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import { Stack, StackItem, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { patchVMTargetName, validateVMTargetName } from '../utils/utils';

type EditVirtualMachineTargetNameProps = {
  plan: V1beta1Plan;
  vmIndex: number;
};

const EditVirtualMachineTargetName: FC<EditVirtualMachineTargetNameProps> = ({ plan, vmIndex }) => {
  const { t } = useForkliftTranslation();
  const vms = getPlanVirtualMachines(plan);
  const [inputValue, setInputValue] = useState(
    (vms as EnhancedPlanSpecVms[])?.[vmIndex]?.targetName ?? '',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validated = isEmpty(errorMessage) ? ValidatedOptions.default : ValidatedOptions.error;

  const vm = getPlanVirtualMachines(plan)[vmIndex];

  return (
    <ModalForm
      title={t('Edit target name')}
      onConfirm={async () => patchVMTargetName({ newValue: inputValue, resource: plan, vmIndex })}
      isDisabled={
        Boolean(validateVMTargetName(inputValue, vms ?? [])) ||
        (isEmpty(vm.targetName) && isEmpty(inputValue)) ||
        vm.targetName === inputValue
      }
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            Enter the name you would like the <b>{vm.name}</b> VM to have after migration.
          </ForkliftTrans>
        </StackItem>
        <StackItem>
          <FormGroupWithHelpText
            validated={validated}
            helperTextInvalid={errorMessage}
            label={t('VM target name')}
          >
            <TextInput
              value={inputValue}
              onChange={(_, val) => {
                setInputValue(val);
              }}
              onBlur={() => {
                setErrorMessage(
                  validateVMTargetName(
                    inputValue,
                    vms?.filter((_, index) => index !== vmIndex) ?? [],
                  ),
                );
              }}
              onFocus={() => {
                setErrorMessage(null);
              }}
              validated={validated}
              data-testid="vm-target-name-input"
            />
          </FormGroupWithHelpText>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditVirtualMachineTargetName;
