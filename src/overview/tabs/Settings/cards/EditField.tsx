import { type FC, type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import { ItemIsOwnedAlert } from 'src/modules/Providers/modals/components/ItemIsOwnedAlert';
import { defaultOnConfirm } from 'src/modules/Providers/modals/EditModal/utils/defaultOnConfirm';
import { getValueByJsonPath } from 'src/modules/Providers/utils/helpers/getValueByJsonPath';
import type { ValidationMsg } from 'src/modules/Providers/utils/validators/common';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { debounce, Form, TextInput } from '@patternfly/react-core';

import type { EditFieldProps } from './EditFieldTypes';

/**
 * `EditField` is a React Functional Component that allows editing a Kubernetes resource property.
 */
export const EditField: FC<EditFieldProps> = ({
  bodyContent,
  defaultValue = '',
  headerContent,
  helperText,
  InputComponent,
  jsonPath,
  label,
  model,
  onConfirmHook = defaultOnConfirm,
  onSave,
  resource,
  validationHook,
}) => {
  const { t } = useForkliftTranslation();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);
  const [value, setValue] = useState(
    (getValueByJsonPath(resource, jsonPath) as string) ?? defaultValue,
  );
  const latestValueRef = useRef(value);
  const [validation, setValidation] = useState<ValidationMsg>({
    msg: null,
    type: 'default',
  });

  const { namespace } = resource?.metadata ?? {};
  const owner = resource?.metadata?.ownerReferences?.[0];

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  /*
   * Init validation
   */
  useEffect(() => {
    if (validationHook) {
      const validationResult = validationHook(value);
      setValidation(validationResult);
    }
  }, [value, validationHook]);

  /*
   * Updates the value when changed from outside
   * TODO: Causes issue where state update 'fights' with user input
   */
  // useEffect(() => {
  //   setValue(getValueByJsonPath(resource, jsonPath) as string);
  // }, [resource, jsonPath]);

  /**
   * Handles save action.
   */
  const handleSave = async () => {
    try {
      await onConfirmHook({ jsonPath, model, newValue: latestValueRef.current, resource });
      onSave?.();
    } catch (err) {
      const message = (err as Error)?.message ?? err;
      setAlertMessage(message);
    }
  };

  const debouncedSaveRef = useRef(debounce(handleSave, 500));

  /**
   * Handles value change.
   */
  const handleValueChange = (newValue: string) => {
    setValue(() => newValue);

    if (validationHook) {
      const validationResult = validationHook(newValue);
      setValidation(validationResult);
    }

    debouncedSaveRef.current();
  };

  const onClick: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  /**
   * InputComponentWithDefault is a higher-order component that renders either the passed-in InputComponent, or a default TextInput,
   */
  const InputComponentWithDefault = InputComponent ? (
    <InputComponent
      value={value}
      onChange={(val) => {
        handleValueChange(val as string);
      }}
    />
  ) : (
    <TextInput
      spellCheck="false"
      id="modal-with-form-form-field"
      name="modal-with-form-form-field"
      value={value}
      onChange={(_e, val) => {
        handleValueChange(val);
      }}
      validated={validation.type}
    />
  );

  return (
    <>
      <Form id="modal-with-form-form">
        <FormGroupWithHelpText
          label={label}
          labelHelp={
            headerContent && bodyContent ? (
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
          {InputComponentWithDefault}
        </FormGroupWithHelpText>
        {typeof owner === 'object' && (
          <ItemIsOwnedAlert owner={owner} namespace={namespace} className="" />
        )}
        {alertMessage && (
          <AlertMessageForModals title={t('Error')} message={alertMessage} className="" />
        )}
      </Form>
    </>
  );
};
