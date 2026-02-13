import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { type ValidationMsg, ValidationState } from 'src/utils/validation/Validation';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, ModalVariant, TextInput } from '@patternfly/react-core';

import ModalForm from './ModalForm';

type FormValues = {
  value: string;
};

type TextInputEditModalProps = {
  title: string;
  label: string;
  initialValue: string;
  description?: ReactNode;
  helperText?: string;
  validationHook?: (value: string) => ValidationMsg;
  onConfirm: (value: string) => Promise<void>;
};

const TextInputEditModal: ModalComponent<TextInputEditModalProps> = ({
  closeModal,
  description,
  helperText,
  initialValue,
  label,
  onConfirm,
  title,
  validationHook,
}) => {
  const {
    formState: { isValid },
    register,
    watch,
  } = useForm<FormValues>({
    defaultValues: { value: initialValue },
    mode: 'onChange',
  });

  const currentValue = watch('value');
  const validation = validationHook?.(currentValue) ?? { msg: '', type: ValidationState.Default };
  const hasError = validation.type === ValidationState.Error;

  const handleConfirm = async (): Promise<void> => {
    await onConfirm(currentValue);
  };

  return (
    <ModalForm
      closeModal={closeModal}
      title={title}
      onConfirm={handleConfirm}
      variant={ModalVariant.large}
      isDisabled={!isValid || hasError}
    >
      {description && <>{description}</>}
      <Form>
        <FormGroupWithHelpText
          label={label}
          fieldId="text-input-edit-modal"
          helperText={validation.msg ?? helperText}
          helperTextInvalid={validation.msg}
          validated={validation.type}
        >
          <TextInput
            id="text-input-edit-modal"
            data-testid="text-input-edit-modal"
            validated={validation.type}
            {...register('value')}
          />
        </FormGroupWithHelpText>
      </Form>
    </ModalForm>
  );
};

export default TextInputEditModal;
