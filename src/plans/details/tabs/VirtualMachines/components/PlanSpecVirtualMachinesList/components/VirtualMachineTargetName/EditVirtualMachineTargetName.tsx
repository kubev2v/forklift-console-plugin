import { type FC, useState } from 'react';
import type { EnhancedPlanSpecVms } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import { Stack, StackItem, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { setVMTargetName, validateVMTargetName } from '../utils/utils';

type EditVirtualMachineTargetNameProps = {
  plan: V1beta1Plan;
  vmIndex: number;
};

const EditVirtualMachineTargetName: FC<EditVirtualMachineTargetNameProps> = ({ plan, vmIndex }) => {
  const { t } = useForkliftTranslation();
  const [inputValue, setInputValue] = useState(
    (plan?.spec?.vms as EnhancedPlanSpecVms[])?.[vmIndex]?.targetName ?? '',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <ModalForm
      title={t('Set target name')}
      onConfirm={async () => setVMTargetName({ newValue: inputValue, resource: plan, vmIndex })}
      isDisabled={Boolean(validateVMTargetName(inputValue, plan?.spec?.vms ?? []))}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            Enter the target name for the <b>{plan?.spec?.vms?.[vmIndex]?.name}</b> VM. This name
            will be used in to create your VM.
          </ForkliftTrans>
        </StackItem>
        <StackItem>
          <FormGroupWithHelpText
            validated={errorMessage ? ValidatedOptions.error : ValidatedOptions.default}
            helperTextInvalid={errorMessage}
          >
            <TextInput
              value={inputValue}
              onChange={(_, val) => {
                setInputValue(val);
              }}
              onBlur={() => {
                setErrorMessage(validateVMTargetName(inputValue, plan?.spec?.vms ?? []));
              }}
              onFocus={() => {
                setErrorMessage(null);
              }}
            />
          </FormGroupWithHelpText>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditVirtualMachineTargetName;
