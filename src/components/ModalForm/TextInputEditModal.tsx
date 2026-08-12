import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { type ValidationMsg, ValidationState } from 'src/utils/validation/Validation';

import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, ModalVariant, TextInput } from '@patternfly/react-core';

import ModalForm from './ModalForm';

type FormValues = {
  value: string;
};

type TextInputEditModalProps = {
  description?: ReactNode;
  helperText?: string;
  initialValue: string;
  label: string;
  onConfirm: (value: string) => Promise<void>;
  title: string;
  validationHook?: (value: string) => ValidationMsg;
};

const TextInputEditModal: OverlayComponent<TextInputEditModalProps> = ({
  closeOverlay,
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
      closeModal={closeOverlay}
      isDisabled={!isValid || hasError}
      onConfirm={handleConfirm}
      title={title}
      variant={ModalVariant.large}
    >
      {description && <>{description}</>}
      <Form>
        <FormGroupWithHelpText
          fieldId="text-input-edit-modal"
          helperText={validation.msg ?? helperText}
          helperTextInvalid={validation.msg}
          label={label}
          validated={validation.type}
        >
          <TextInput
            data-testid="text-input-edit-modal"
            id="text-input-edit-modal"
            validated={validation.type}
            {...register('value')}
          />
        </FormGroupWithHelpText>
      </Form>
    </ModalForm>
  );
};

export default TextInputEditModal;
