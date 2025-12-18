import type { FC } from 'react';
import { type RegisterOptions, useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { type FormGroupProps, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';
import type { CreateProviderFormData } from '../types';

import type { ProviderFormFieldIdType } from './constants';

type ProviderFormTextInputProps = {
  fieldId: ProviderFormFieldIdType;
  fieldRules:
    | Omit<
        RegisterOptions<CreateProviderFormData, any>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
      >
    | undefined;
  label: string;
  labelHelp?: FormGroupProps['labelHelp'];
  testId?: string;
  isRequired?: boolean;
  helperText?: string;
};

const ProviderFormTextInput: FC<ProviderFormTextInputProps> = ({
  fieldId,
  fieldRules,
  helperText,
  isRequired = true,
  label,
  labelHelp,
  testId,
}) => {
  const { control } = useCreateProviderFormContext();

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
      labelHelp={labelHelp}
      isRequired={isRequired}
      fieldId={fieldId}
      validated={getInputValidated(error)}
      helperText={helperText}
      helperTextInvalid={error?.message}
    >
      <TextInput
        type="text"
        id={fieldId}
        value={(fieldValue as string) ?? ''}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={getInputValidated(error)}
        data-testid={testId}
      />
    </FormGroupWithHelpText>
  );
};

export default ProviderFormTextInput;
