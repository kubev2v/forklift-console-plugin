import { type FC, useState } from 'react';
import { type RegisterOptions, useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';
import type { CreateProviderFormData } from '../types';

import type { ProviderFormFieldIdType } from './constants';

type ProviderFormPasswordInputProps = {
  fieldId: ProviderFormFieldIdType;
  fieldRules:
    | Omit<
        RegisterOptions<CreateProviderFormData, any>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
      >
    | undefined;
  label: string;
  isRequired?: boolean;
  testId?: string;
  helperText?: string;
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
      label={label}
      isRequired={isRequired}
      fieldId={fieldId}
      validated={getInputValidated(error)}
      helperText={helperText}
      helperTextInvalid={error?.message}
      testId={testId ? `${testId}-helper` : undefined}
    >
      <InputGroup>
        <TextInput
          type={textHidden ? 'password' : 'text'}
          id={fieldId}
          value={(fieldValue as string) ?? ''}
          onChange={(_event, val) => {
            onChange(val);
          }}
          validated={getInputValidated(error)}
          data-testid={testId}
          spellCheck="false"
          aria-label={`${label} input`}
        />
        <Button
          variant={ButtonVariant.control}
          onClick={() => {
            setTextHidden((prev) => !prev);
          }}
          aria-label={textHidden ? `${label} show` : `${label} hide`}
          data-testid={testId ? `${testId}-toggle` : undefined}
        >
          {textHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </InputGroup>
    </FormGroupWithHelpText>
  );
};

export default ProviderFormPasswordInput;
