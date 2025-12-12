import type { FC } from 'react';
import { useController } from 'react-hook-form';
import type { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';

import { useCreateProviderFormContext } from '../../../hooks/useCreateProviderFormContext';
import type { ProviderFormFieldIdType } from '../../constants';

import { validateOpenstackField } from './useOpenstackFieldValidation';

type OpenstackTextFieldProps = {
  fieldId: ProviderFormFieldIdType;
  openstackFieldId: OpenstackSecretFieldsId;
  label: string;
  isRequired?: boolean;
  testId?: string;
  helperText?: string;
};

const OpenstackTextField: FC<OpenstackTextFieldProps> = ({
  fieldId,
  helperText,
  isRequired = true,
  label,
  openstackFieldId,
  testId,
}) => {
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: fieldId,
    rules: {
      ...(isRequired && { required: `${label} is required` }),
      validate: validateOpenstackField(openstackFieldId),
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
    >
      <TextInput
        type="text"
        id={fieldId}
        value={typeof value === 'string' ? value : ''}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={getInputValidated(error)}
        data-testid={testId}
      />
    </FormGroupWithHelpText>
  );
};

export default OpenstackTextField;
