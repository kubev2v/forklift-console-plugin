import React, { ReactNode, useCallback, useReducer, useState } from 'react';
import { AlertMessageForModals, useModal } from 'src/modules/Providers/modals';
import { validateNoSpaces } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkAdapters, V1beta1Provider } from '@kubev2v/types';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { calculateCidrNotation, InventoryHostPair, onSaveHost } from '../utils';

import './VSphereNetworkModal.style.css';

export interface VSphereNetworkModalProps {
  provider: V1beta1Provider;
  data: InventoryHostPair[];
  selected: string[];
}

const initialState = {
  isLoading: false,
  isSelectOpen: false,
  passwordHidden: true,
  isSaveDisabled: true,
  network: '',
  username: '',
  password: '',
  validation: {
    username: 'default',
    password: 'default',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NETWORK':
      return {
        ...state,
        network: action.payload,
        isSaveDisabled: shouldDisableSave(state, { network: action.payload }),
      };
    case 'TOGGLE_OPEN':
      return { ...state, isSelectOpen: !state.isSelectOpen };
    case 'TOGGLE_LOADING':
      return { ...state, isLoading: !state.isLoading };
    case 'SET_USERNAME': {
      const isValidUsername = validateUsername(action.payload);
      return {
        ...state,
        username: action.payload,
        isSaveDisabled: shouldDisableSave(state, { username: action.payload, isValidUsername }),
        validation: { ...state.validation, username: isValidUsername ? 'success' : 'error' },
      };
    }
    case 'SET_PASSWORD': {
      const isValidPassword = validatePassword(action.payload);
      return {
        ...state,
        password: action.payload,
        isSaveDisabled: shouldDisableSave(state, { password: action.payload, isValidPassword }),
        validation: { ...state.validation, password: isValidPassword ? 'success' : 'error' },
      };
    }
    case 'TOGGLE_PASSWORD_HIDDEN':
      return { ...state, passwordHidden: !state.passwordHidden };
    default:
      throw new Error();
  }
}

function shouldDisableSave(state, updatedFields) {
  const updatedState = { ...state, ...updatedFields };
  return (
    !updatedState.network ||
    !updatedState.username ||
    !updatedState.password ||
    !validateUsername(updatedState.username) ||
    !validatePassword(updatedState.password)
  );
}

export const VSphereNetworkModal: React.FC<VSphereNetworkModalProps> = ({
  provider,
  data,
  selected,
}) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const [state, dispatch] = useReducer(reducer, initialState);

  const onSelectToggle = () => dispatch({ type: 'TOGGLE_OPEN' });

  const onSelect = (_event, selection) => {
    const selectedAdapter = getNetworkAdapterByLabel(
      firstInventoryHostPair.inventory.networkAdapters,
      selection,
    );

    dispatch({ type: 'SET_NETWORK', payload: selectedAdapter });
    onSelectToggle();
  };

  const toggleIsLoading = () => dispatch({ type: 'TOGGLE_LOADING' });
  const togglePasswordHidden = () => dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });

  const selectedInventoryHostPairs = data
    .filter((pair) => selected.includes(pair.inventory.id))
    .sort((a, b) => a.inventory.name.localeCompare(b.inventory.name));

  const selectedLength = selected.length;
  const firstInventoryHostPair = selectedInventoryHostPairs[0];

  /**
   * Handles save action.
   */
  const handleSave = useCallback(async () => {
    toggleIsLoading();

    try {
      await onSaveHost({
        provider,
        hostPairs: selectedInventoryHostPairs,
        network: state.network,
        user: state.username,
        password: state.password,
      });

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(
        <AlertMessageForModals title={t('Error')} message={err.message || err.toString()} />,
      );
    }
  }, [state, selected]);

  const actions = [
    <Button
      key="confirm"
      onClick={handleSave}
      variant="primary"
      isDisabled={state.isSaveDisabled}
      isLoading={state.isLoading}
    >
      {t('Save')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  const networkOptions = firstInventoryHostPair.inventory.networkAdapters.map((adapter) => {
    const cidr = calculateCidrNotation(adapter.ipAddress, adapter.subnetMask);

    return {
      key: adapter.name,
      label: `${adapter.name} - ${cidr}`,
      description: `${adapter.linkSpeed} Mbps, MTU: ${adapter.mtu}`,
      disabled: false,
    };
  });

  return (
    <Modal
      title={t('Select migration network')}
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      <div className="forklift-edit-modal-body">
        {t(
          'You can select a migration network for a source provider to reduce risk to the source environment and to improve performance.',
        )}
      </div>

      <div className="forklift-edit-modal-body">
        <strong>{t('{{selectedLength}} hosts selected.', { selectedLength })}</strong>
      </div>

      <Form id="modal-with-form-form">
        <FormGroup label="Network" isRequired fieldId="network">
          <Select
            variant={SelectVariant.single}
            placeholderText="Select a network"
            aria-label="Select Network"
            onToggle={onSelectToggle}
            onSelect={onSelect}
            selections={
              state.network ? `${state.network.name} - ${state.network.ipAddress}` : undefined
            }
            isOpen={state.isSelectOpen}
            menuAppendTo={() => document.body}
          >
            {networkOptions.map((option) => (
              <SelectOption
                isDisabled={option.disabled}
                key={option.key}
                value={option.label}
                description={option.description}
              />
            ))}
          </Select>
        </FormGroup>

        <FormGroup
          label="ESXi host admin username"
          isRequired
          fieldId="username"
          helperText={t('The username for the ESXi host admin')}
          helperTextInvalid={t('Invalid username')}
          validated={state.validation.username}
        >
          <TextInput
            isRequired
            type="text"
            id="username"
            value={state.username}
            onChange={(value) => dispatch({ type: 'SET_USERNAME', payload: value })}
            validated={state.validation.username}
          />
        </FormGroup>

        <FormGroup
          label="ESXi host admin password"
          isRequired
          fieldId="password"
          helperText={t('The password for the ESXi host admin')}
          helperTextInvalid={t('Invalid password')}
          validated={state.validation.password}
        >
          <TextInput
            className="forklift-host-modal-input-secret"
            isRequired
            type={state.passwordHidden ? 'password' : 'text'}
            aria-label="Password input"
            value={state.password}
            onChange={(value) => dispatch({ type: 'SET_PASSWORD', payload: value })}
            validated={state.validation.password}
          />
          <Button variant="control" onClick={togglePasswordHidden}>
            {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </FormGroup>
      </Form>

      {alertMessage}
    </Modal>
  );
};

function getNetworkAdapterByLabel(networkAdapters: NetworkAdapters[], label: string) {
  const selectedAdapter = networkAdapters.find((adapter) => {
    const cidr = calculateCidrNotation(adapter.ipAddress, adapter.subnetMask);
    const adapterLabel = `${adapter.name} - ${cidr}`;
    return adapterLabel === label;
  });

  return selectedAdapter;
}

function validateUsername(username) {
  return validateNoSpaces(username);
}

function validatePassword(password) {
  return validateNoSpaces(password);
}
