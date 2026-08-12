import type { FC } from 'react';
import { type RegisterOptions, useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { type FormGroupProps, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';

import type { ProviderFormFieldIdType } from './constants';

type ProviderFormTextInputProps = {
  fieldId: ProviderFormFieldIdType;
  fieldRules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  helperText?: string;
  isRequired?: boolean;
  label: string;
  labelHelp?: FormGroupProps['labelHelp'];
  testId?: string;
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
      fieldId={fieldId}
      helperText={helperText}
      helperTextInvalid={error?.message}
      isRequired={isRequired}
      label={label}
      labelHelp={labelHelp}
      testId={testId ? `${testId}-helper` : undefined}
      validated={getInputValidated(error)}
    >
      <TextInput
        data-testid={testId}
        id={fieldId}
        onChange={(_event, val) => {
          onChange(val);
        }}
        type="text"
        validated={getInputValidated(error)}
        value={(fieldValue as string) ?? ''}
      />
    </FormGroupWithHelpText>
  );
};

export default ProviderFormTextInput;
