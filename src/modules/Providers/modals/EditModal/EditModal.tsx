import {
  type FC,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Button, Form, Modal, ModalVariant, Stack, TextInput } from '@patternfly/react-core';

import useToggle from '../../hooks/useToggle';
import { getValueByJsonPath } from '../../utils/helpers/getValueByJsonPath';
import { AlertMessageForModals } from '../components/AlertMessageForModals';
import { ItemIsOwnedAlert } from '../components/ItemIsOwnedAlert';
import { useModal } from '../ModalHOC/ModalHOC';

import { defaultOnConfirm } from './utils/defaultOnConfirm';
import type { EditModalProps } from './types';

import './EditModal.style.css';

/**
 * `EditModal` is a React Functional Component that allows editing a Kubernetes resource property inside a modal.
 *
 * @component
 * @param {object} props - The properties that define the behavior and display of the `EditModal`.
 * @param {K8sResourceCommon} props.resource - The Kubernetes resource that will be modified.
 * @param {K8sModel} props.model - The model for the Kubernetes resource.
 * @param {string | string[]} props.jsonPath - The JSON path to the property in the resource that will be modified.
 * @param {string} props.title - The title of the modal.
 * @param {string} props.label - The label of the field being edited.
 * @param {ReactNode} [props.body] - The body content of the modal.
 * @param {ReactNode} [props.headerContent] - The help popup header content of the input field.
 * @param {ReactNode} [props.bodyContent] - The help popup content in the body of the input field.
 * @param {'small' | 'default' | 'medium' | 'large'} [props.variant] - The size of the modal.
 * @param {OnConfirmHookType} [props.onConfirmHook] - A hook that gets called when the user confirms the edit.
 * @param {ModalInputComponentType} [props.InputComponent] - The component used for the input field.
 * @param {string} [props.helperText] - Helper text that will be displayed under the input field.
 * @param {string} [props.redirectTo] - The path to redirect to after the modal is closed.
 * @param {ValidationHookType} [props.validationHook] - A hook that is used to validate the new value.
 *
 * @returns {ReactElement} Returns a `Modal` React Element that renders the modal.
 */
export const EditModal: FC<EditModalProps> = ({
  body,
  bodyContent,
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
  const { toggleModal } = useModal();

  const [isLoading, toggleIsLoading] = useToggle();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);
  const [value, setValue] = useState(getValueByJsonPath(resource, jsonPath) as string);
  const [validation, setValidation] = useState<ValidationMsg>({
    msg: '',
    type: 'default',
  });

  const { namespace } = resource?.metadata || {};
  const owner = resource?.metadata?.ownerReferences?.[0];

  /*
   * Init validation
   */
  useEffect(() => {
    if (validationHook) {
      const validationResult = validationHook(value);
      setValidation(validationResult);
    }
  }, [validationHook]);

  /**
   * Handles value change.
   */
  const handleValueChange = (newValue: string) => {
    setValue(newValue);

    if (validationHook) {
      const validationResult = validationHook(newValue);
      setValidation(validationResult);
    }
  };

  /**
   * Handles save action.
   */
  const handleSave = useCallback(async () => {
    toggleIsLoading();

    try {
      await onConfirmHook({ jsonPath, model, newValue: value, resource });

      if (redirectTo) {
        navigate(redirectTo);
      }

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(
        <AlertMessageForModals title={t('Error')} message={err.message || err.toString()} />,
      );
    }
  }, [resource, value, onConfirmHook]);

  const onClick: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  const onChange: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    handleValueChange(value);
  };

  /**
   * InputComponent_ is a higher-order component that renders either the passed-in InputComponent, or a default TextInput,
   */
  const InputComponent_ = InputComponent ? (
    <InputComponent
      value={value}
      onChange={(value) => {
        handleValueChange(value);
      }}
    />
  ) : (
    <TextInput
      spellCheck="false"
      id="modal-with-form-form-field"
      name="modal-with-form-form-field"
      value={value}
      onChange={(e, value) => {
        onChange(value, e);
      }}
      validated={validation.type}
    />
  );

  const actions = [
    <Button
      key="confirm"
      variant="primary"
      onClick={handleSave}
      isDisabled={validation.type === 'error'}
      isLoading={isLoading}
    >
      {t('Save')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal} autoFocus>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={title}
      position="top"
      showClose={false}
      variant={variant || ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      <Stack hasGutter>
        <div>{body}</div>

        {isVisible && (
          <Form id="modal-with-form-form">
            <FormGroupWithHelpText
              label={label}
              labelIcon={
                bodyContent || headerContent ? (
                  <HelpIconPopover header={headerContent} onClick={onClick}>
                    {bodyContent}
                  </HelpIconPopover>
                ) : undefined
              }
              fieldId="modal-with-form-form-field"
              helperText={validation.msg || helperText}
              helperTextInvalid={validation.msg || helperText}
              validated={validation.type}
            >
              {InputComponent_}
            </FormGroupWithHelpText>
          </Form>
        )}
      </Stack>
      {typeof owner === 'object' && <ItemIsOwnedAlert owner={owner} namespace={namespace} />}
      {alertMessage}
    </Modal>
  );
};
