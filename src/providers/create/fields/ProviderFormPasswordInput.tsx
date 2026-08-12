import { type FC, useState } from 'react';
import { type RegisterOptions, useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';

import type { ProviderFormFieldIdType } from './constants';

type ProviderFormPasswordInputProps = {
  fieldId: ProviderFormFieldIdType;
  fieldRules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  helperText?: string;
  isRequired?: boolean;
  label: string;
  testId?: string;
};
const ProviderFormPasswordInput: FC<ProviderFormPasswordInputProps> = ({
  fieldId,
  fieldRules,
  helperText,
  isRequired = true,
  label,
  testId,
}) => {
  const { control } = useCreateProviderFormContext();
  const [textHidden, setTextHidden] = useState<boolean>(true);

  const {
    field: { onChange, value: fieldValue },
    fieldState: { error },
  } = useController({
    control,
    name: fieldId,
    rules: {
      ...(isRequired && !fieldRules?.required && { required: `${label} is required` }),
      ...fieldRules,
    },
  });
  return (
    <FormGroupWithHelpText
      fieldId={fieldId}
      helperText={helperText}
      helperTextInvalid={error?.message}
      isRequired={isRequired}
      label={label}
      testId={testId ? `${testId}-helper` : undefined}
      validated={getInputValidated(error)}
    >
      <InputGroup>
        <TextInput
          aria-label={`${label} input`}
          data-testid={testId}
          id={fieldId}
          onChange={(_event, val) => {
            onChange(val);
          }}
          spellCheck="false"
          type={textHidden ? 'password' : 'text'}
          validated={getInputValidated(error)}
          value={(fieldValue as string) ?? ''}
        />
        <Button
          aria-label={textHidden ? `${label} show` : `${label} hide`}
          data-testid={testId ? `${testId}-toggle` : undefined}
          onClick={() => {
            setTextHidden((prev) => !prev);
          }}
          variant={ButtonVariant.control}
        >
          {textHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </InputGroup>
    </FormGroupWithHelpText>
  );
};

export default ProviderFormPasswordInput;
