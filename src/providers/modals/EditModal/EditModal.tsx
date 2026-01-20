import { type MouseEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { getValueByJsonPath } from 'src/utils/helpers/getValueByJsonPath';
import useToggle from 'src/utils/hooks/useToggle';
import { useForkliftTranslation } from 'src/utils/i18n';
import { type ValidationMsg, ValidationState } from 'src/utils/validation/Validation';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Button,
  ButtonVariant,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';

import { AlertMessageForModals } from '../components/AlertMessageForModals';
import { ItemIsOwnedAlert } from '../components/ItemIsOwnedAlert';

import { defaultOnConfirm } from './utils/defaultOnConfirm';
import type { EditModalProps } from './types';

import './EditModal.style.css';

export const EditModal: ModalComponent<EditModalProps> = ({
  body,
  bodyContent,
  closeModal,
  headerContent,
  helperText,
  InputComponent,
  isVisible = true,
  jsonPath,
  label,
  model,
  onConfirmHook = defaultOnConfirm,
  redirectTo,
  resource,
  title,
  validationHook,
  variant,
}) => {
  const { t } = useForkliftTranslation();
  const [isLoading, toggleIsLoading] = useToggle();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);
  const [value, setValue] = useState(getValueByJsonPath(resource, jsonPath));
  const [validation, setValidation] = useState<ValidationMsg>({
    msg: '',
    type: ValidationState.Default,
  });

  const { namespace, ownerReferences } = resource?.metadata ?? {};
  const owner = ownerReferences?.[0];

  useEffect(() => {
    if (validationHook) {
      setValidation(validationHook(value));
    }
  }, [validationHook, value]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (validationHook) {
      setValidation(validationHook(newValue));
    }
  };

  const handleSave = useCallback(async () => {
    toggleIsLoading();

    try {
      await onConfirmHook({ jsonPath, model, newValue: value, resource });
      if (redirectTo) navigate(redirectTo);
      closeModal();
    } catch (err) {
      toggleIsLoading();
      const message = err instanceof Error ? (err.message ?? err.toString()) : t('Unknown error');
      setAlertMessage(<AlertMessageForModals title={t('Error')} message={message} />);
    }
  }, [
    resource,
    value,
    onConfirmHook,
    jsonPath,
    model,
    navigate,
    redirectTo,
    t,
    toggleIsLoading,
    closeModal,
  ]);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const Component = InputComponent ? (
    <InputComponent
      value={value}
      onChange={(newValue) => {
        handleValueChange(String(newValue));
      }}
    />
  ) : (
    <TextInput
      spellCheck="false"
      id="modal-with-form-form-field"
      name="modal-with-form-form-field"
      value={value}
      onChange={(_e, newValue) => {
        handleValueChange(newValue);
      }}
      validated={validation.type}
    />
  );

  return (
    <Modal
      position="top"
      variant={variant ?? ModalVariant.small}
      isOpen={true}
      onClose={closeModal}
    >
      <ModalHeader title={title} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{body}</StackItem>

          {isVisible && (
            <StackItem>
              <Form id="modal-with-form-form">
                <FormGroupWithHelpText
                  label={label}
                  labelHelp={
                    bodyContent || headerContent ? (
                      <HelpIconPopover header={headerContent} onClick={onClick}>
                        {bodyContent}
                      </HelpIconPopover>
                    ) : undefined
                  }
                  fieldId="modal-with-form-form-field"
                  helperText={validation.msg ?? helperText}
                  helperTextInvalid={validation.msg ?? helperText}
                  validated={validation.type}
                >
                  {Component}
                </FormGroupWithHelpText>
              </Form>
            </StackItem>
          )}

          {typeof owner === 'object' && (
            <StackItem>
              <ItemIsOwnedAlert owner={owner} namespace={namespace} />
            </StackItem>
          )}

          {alertMessage && <StackItem>{alertMessage}</StackItem>}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={handleSave}
          isDisabled={validation.type === ValidationState.Error}
          isLoading={isLoading}
        >
          {t('Save')}
        </Button>
        <Button key="cancel" variant={ButtonVariant.secondary} onClick={closeModal} autoFocus>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
