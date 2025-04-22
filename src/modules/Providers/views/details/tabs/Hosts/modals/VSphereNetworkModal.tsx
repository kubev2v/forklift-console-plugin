import { type FC, type FormEvent, type ReactNode, useCallback, useReducer, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { SelectEventType, SelectValueType } from '@components/common/utils/types';
import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import type { NetworkAdapters, V1beta1Provider } from '@kubev2v/types';
import {
  Button,
  Form,
  HelperText,
  HelperTextItem,
  InputGroup,
  Modal,
  ModalVariant,
  Text,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { calculateCidrNotation } from '../utils/helpers/calculateCidrNotation';
import type { InventoryHostPair } from '../utils/helpers/matchHostsToInventory';
import { onSaveHost } from '../utils/helpers/onSaveHost';

import './VSphereNetworkModal.style.css';

type VSphereNetworkModalProps = {
  provider: V1beta1Provider;
  data: InventoryHostPair[];
  selected: string[];
};

type ValidationState = 'success' | 'warning' | 'error' | 'default' | undefined;

type State = {
  endpointType: string;
  isLoading: boolean;
  isSaveDisabled: boolean;
  isSelectOpen: boolean;
  network: NetworkAdapters;
  password: string;
  passwordHidden: boolean;
  username: string;
  validation: {
    password: ValidationState;
    username: ValidationState;
  };
};

type Action =
  | { type: 'SET_NETWORK'; payload: NetworkAdapters }
  | { type: 'TOGGLE_OPEN' }
  | { type: 'TOGGLE_LOADING' }
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'TOGGLE_PASSWORD_HIDDEN' };

const initialState = {
  endpointType: 'vcenter',
  isLoading: false,
  isSaveDisabled: true,
  isSelectOpen: false,
  network: undefined as unknown as NetworkAdapters,
  password: '',
  passwordHidden: true,
  username: '',
  validation: {
    password: 'default' as ValidationState,
    username: 'default' as ValidationState,
  },
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_NETWORK':
      return {
        ...state,
        isSaveDisabled: shouldDisableSave(state, { network: action.payload }),
        network: action.payload,
      };
    case 'TOGGLE_OPEN':
      return { ...state, isSelectOpen: !state.isSelectOpen };
    case 'TOGGLE_LOADING':
      return { ...state, isLoading: !state.isLoading };
    case 'SET_USERNAME': {
      const isValidUsername = validateUsername(action.payload);
      return {
        ...state,
        isSaveDisabled: shouldDisableSave(state, { isValidUsername, username: action.payload }),
        username: action.payload,
        validation: { ...state.validation, username: isValidUsername ? 'success' : 'error' },
      };
    }
    case 'SET_PASSWORD': {
      const isValidPassword = validatePassword(action.payload);
      return {
        ...state,
        isSaveDisabled: shouldDisableSave(state, { isValidPassword, password: action.payload }),
        password: action.payload,
        validation: { ...state.validation, password: isValidPassword ? 'success' : 'error' },
      };
    }
    case 'TOGGLE_PASSWORD_HIDDEN':
      return { ...state, passwordHidden: !state.passwordHidden };
    default:
      throw new Error();
  }
};

const shouldDisableSave = (state, updatedFields) => {
  const updatedState = { ...state, ...updatedFields };

  if (state.endpointType === 'esxi') {
    return !updatedState.network;
  }

  return (
    !updatedState.network ||
    !updatedState.username ||
    !updatedState.password ||
    !validateUsername(updatedState.username) ||
    !validatePassword(updatedState.password)
  );
};

export const VSphereNetworkModal: FC<VSphereNetworkModalProps> = ({ data, provider, selected }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const endpointType = provider?.spec?.settings?.sdkEndpoint ?? '';

  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, {
    ...initialState,
    endpointType,
  });

  const onSelectToggle = () => {
    dispatch({ type: 'TOGGLE_OPEN' });
  };

  const onSelect: (
    event: SelectEventType,
    value: SelectValueType,
    isPlaceholder?: boolean,
  ) => void = (_event, value: string) => {
    const selectedAdapter = getNetworkAdapterByLabel(
      firstInventoryHostPair.inventory.networkAdapters,
      value,
    );

    dispatch({ payload: selectedAdapter, type: 'SET_NETWORK' });
    onSelectToggle();
  };

  const toggleIsLoading = () => {
    dispatch({ type: 'TOGGLE_LOADING' });
  };
  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  const selectedInventoryHostPairs = data
    .filter((pair) => selected.includes(pair.inventory.id))
    .sort((a, b) => a.inventory.name.localeCompare(b.inventory.name));

  const selectedLength = selected.length;
  const [firstInventoryHostPair] = selectedInventoryHostPairs;

  /**
   * Handles save action.
   */
  const handleSave = useCallback(async () => {
    toggleIsLoading();

    try {
      await onSaveHost({
        hostPairs: selectedInventoryHostPairs,
        network: state.network,
        password: endpointType === 'esxi' ? undefined : state.password,
        provider,
        user: endpointType === 'esxi' ? undefined : state.username,
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
      description: `${adapter.linkSpeed} Mbps, MTU: ${adapter.mtu}`,
      disabled: false,
      key: adapter.name,
      label: `${adapter.name} - ${cidr}`,
    };
  });

  const onChangUser: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    dispatch({ payload: value, type: 'SET_USERNAME' });
  };

  const onChangePassword: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    dispatch({ payload: value, type: 'SET_PASSWORD' });
  };

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
        <FormGroupWithHelpText label="Network" isRequired fieldId="network">
          <FilterableSelect
            placeholder="Select a network"
            aria-label="Select Network"
            onSelect={(value) => {
              onSelect(null, value);
            }}
            value={state.network ? `${state.network.name} - ${state.network.ipAddress}` : undefined}
            selectOptions={networkOptions.map((option) => ({
              children: (
                <>
                  <Text>{option.label}</Text>
                  {option.description && (
                    <HelperText>
                      <HelperTextItem variant="indeterminate">{option.description}</HelperTextItem>
                    </HelperText>
                  )}
                </>
              ),
              isDisabled: option.disabled,
              itemId: option.label,
            }))}
          />
        </FormGroupWithHelpText>

        {endpointType !== 'esxi' && (
          <>
            <FormGroupWithHelpText
              label="ESXi host admin username"
              isRequired
              fieldId="username"
              helperText={t('The username for the ESXi host admin')}
              helperTextInvalid={t('Invalid username')}
              validated={state.validation.username}
            >
              <TextInput
                spellCheck="false"
                isRequired
                type="text"
                id="username"
                value={state.username}
                onChange={(e, value) => {
                  onChangUser(value, e);
                }}
                validated={state.validation.username}
              />
            </FormGroupWithHelpText>
            <FormGroupWithHelpText
              label="ESXi host admin password"
              isRequired
              fieldId="password"
              helperText={t('The password for the ESXi host admin')}
              helperTextInvalid={t('Invalid password')}
              validated={state.validation.password}
            >
              <InputGroup>
                <TextInput
                  spellCheck="false"
                  className="forklift-host-modal-input-secret"
                  isRequired
                  type={state.passwordHidden ? 'password' : 'text'}
                  aria-label="Password input"
                  value={state.password}
                  onChange={(e, value) => {
                    onChangePassword(value, e);
                  }}
                  validated={state.validation.password}
                />
                <Button variant="control" onClick={togglePasswordHidden}>
                  {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
                </Button>
              </InputGroup>
            </FormGroupWithHelpText>
          </>
        )}
      </Form>

      {alertMessage}
    </Modal>
  );
};

const getNetworkAdapterByLabel = (networkAdapters: NetworkAdapters[], label: string) => {
  const selectedAdapter = networkAdapters.find((adapter) => {
    const cidr = calculateCidrNotation(adapter.ipAddress, adapter.subnetMask);
    const adapterLabel = `${adapter.name} - ${cidr}`;
    return adapterLabel === label;
  });

  return selectedAdapter;
};

const validateUsername = (username) => {
  return validateNoSpaces(username);
};

const validatePassword = (password) => {
  return validateNoSpaces(password);
};
