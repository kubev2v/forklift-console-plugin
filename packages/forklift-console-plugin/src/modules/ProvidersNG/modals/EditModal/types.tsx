import React, { ReactNode } from 'react';

import { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import './EditModal.style.css';

export interface EditModalProps {
  /** The Kubernetes resource being edited. This object contains all the information about the Kubernetes resource including its metadata, status, and spec. */
  resource: K8sResourceCommon;

  /** The model of the Kubernetes resource. This object contains the information about the Kubernetes kind, apiVersion, and other model specific details. */
  model: K8sModel;

  /** The JSON path of the value in the resource object that needs to be edited. This can either be a string or an array of strings. */
  jsonPath: string | string[];

  /** The title of the modal that will be displayed at the top. */
  title: string;

  /** The label of the form input field. */
  label: string;

  /** Optional. The content to be displayed in the modal's body. */
  body?: ReactNode;

  /** Optional. The header of the field help popup. */
  headerContent?: ReactNode;

  /** Optional. The content of the field help popup. */
  bodyContent?: ReactNode;

  /** Optional. The size variant of the modal. Can be 'small', 'default', 'medium', or 'large'. */
  variant?: 'small' | 'default' | 'medium' | 'large';

  /** Optional. The custom input component to be used in the form. If not provided, a default TextInput will be used. */
  InputComponent?: ModalInputComponentType;

  /** Optional. Helper text that provides additional hints to the user, printed in grayed text under the input field. */
  helperText?: string;

  /** Optional. The URL to which the user will be redirected after the confirmation action. */
  redirectTo?: string;

  /** Optional. The hook function to be called when the confirmation button is clicked. */
  onConfirmHook?: OnConfirmHookType;

  /** Optional. The validation hook function that checks the new input value and returns a helper text and validation status. */
  validationHook?: ValidationHookType;
}

/**
 * ValidationResults type defines the possible states of a validation result.
 * 'success' means the validation was successful,
 * 'error' means the validation failed,
 * 'warning' indicates a potential issue but not a failure,
 * undefined indicates no validation state is set.
 */
export type ValidationResults = 'success' | 'error' | 'warning' | undefined;

/**
 * ModalInputComponentType defines the functional component type for the input fields used in the modal.
 * It accepts two props:
 * 'value' which can be a string or a number,
 * and 'onChange' a callback function which is triggered when the value of the input changes.
 */
export type ModalInputComponentType = React.FC<{
  value: string | number;
  onChange: (value: string) => void;
}>;

/**
 * ValidationHookType defines the structure of a hook function that performs validation.
 * It accepts a value, which can be a string or a number, and returns an object containing
 * 'validationHelpText' which is a string giving details about the result of the validation,
 * and 'validated' which indicates the status of the validation and is of type ValidationResults.
 */
export type ValidationHookType = (value: string | number) => {
  validationHelpText: string;
  validated: ValidationResults;
};

/**
 * OnConfirmHookType defines the structure of a hook function that is called when the confirmation action takes place.
 * It accepts an object as an argument with four fields:
 * 'resource' which is the Kubernetes resource being modified,
 * 'newValue' which is the updated value for the resource,
 * 'jsonPath' is the path in the JSON representation of the resource where the new value is applied,
 * 'model' represents the model of the Kubernetes resource.
 * The function returns a promise that resolves to the updated Kubernetes resource.
 */
export type OnConfirmHookType = ({
  resource,
  newValue,
  jsonPath,
  model,
}: {
  resource: K8sResourceCommon;
  newValue: unknown;
  jsonPath?: string | string[];
  model?: K8sModel;
}) => Promise<K8sResourceCommon>;
