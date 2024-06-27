import React, { useReducer } from 'react';
import { Base64 } from 'js-base64';
import { ModalHOC } from 'src/modules/Providers/modals';
import { validateK8sName, ValidationMsg } from 'src/modules/Providers/utils';
import { SelectableCard } from 'src/modules/Providers/utils/components/Gallery/SelectableCard';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { IoK8sApiCoreV1Secret, ProviderType, V1beta1Provider } from '@kubev2v/types';
import {
  Flex,
  FlexItem,
  Form,
  HelperText,
  HelperTextItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';

import { EditProvider } from './EditProvider';
import { EditProviderSectionHeading } from './EditProviderSectionHeading';
import { providerCardItems } from './providerCardItems';
export interface ProvidersCreateFormProps {
  newProvider: V1beta1Provider;
  newSecret: IoK8sApiCoreV1Secret;
  onNewProviderChange: (V1beta1Provider) => void;
  onNewSecretChange: (IoK8sApiCoreV1Secret) => void;
  providerNames?: string[];
}

export const ProvidersCreateForm: React.FC<ProvidersCreateFormProps> = ({
  newProvider,
  newSecret,
  onNewProviderChange,
  onNewSecretChange,
  providerNames = [],
}) => {
  const { t } = useForkliftTranslation();

  const initialState = {
    validation: {
      name: { type: 'default', msg: 'Unique Kubernetes resource name identifier.' },
    },
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_VALIDATION':
        return { ...state, validation: action.payload };
      default:
        return state;
    }
  }, initialState);

  const handleNameChange = (name: string) => {
    const trimmedValue = name.trim();
    let validation: ValidationMsg;

    if (trimmedValue === '') {
      validation = { type: 'error', msg: 'Required, unique Kubernetes resource name identifier.' };
    } else if (providerNames.includes(trimmedValue))
      validation = {
        type: 'error',
        msg: `A provider named ${trimmedValue} already exists in the system`,
      };
    else if (!validateK8sName(trimmedValue)) {
      validation = { type: 'error', msg: 'Invalid kubernetes resource name' };
    } else {
      validation = { type: 'success', msg: 'Unique Kubernetes resource name identifier.' };
    }

    dispatch({
      type: 'SET_VALIDATION',
      payload: { name: validation },
    });

    onNewProviderChange({
      ...newProvider,
      metadata: { ...newProvider?.metadata, name: trimmedValue },
    });
  };

  const handleTypeChange = (type: ProviderType) => {
    // default auth type for openstack (if not defined)
    if (type === 'openstack' && !newSecret?.data?.authType) {
      onNewSecretChange({
        ...newSecret,
        data: { ...newSecret.data, authType: Base64.encode('applicationcredential') },
      });
    }

    onNewProviderChange({ ...newProvider, spec: { ...newProvider?.spec, type: type } });
  };

  return (
    <ModalHOC>
      <div className="forklift-create-provider-edit-section">
        <EditProviderSectionHeading text={t('Provider details')} />

        <Form isWidthLimited className="forklift-section-secret-edit">
          <FormGroupWithHelpText label={t('Select provider type')} isRequired fieldId="type">
            {newProvider?.spec?.type ? (
              <Flex>
                <FlexItem className="forklift--create-provider-edit-card-selected">
                  <SelectableCard
                    title={providerCardItems[newProvider?.spec?.type]?.title}
                    titleLogo={providerCardItems[newProvider?.spec?.type]?.logo}
                    onChange={() => handleTypeChange(null)}
                    isSelected
                    isCompact
                    content={
                      <Tooltip
                        content={
                          <div>{t('Click to select a different provider from the list.')}</div>
                        }
                      >
                        <HelperText>
                          <HelperTextItem variant="indeterminate">
                            {t('Click to unselect.')}
                          </HelperTextItem>
                        </HelperText>
                      </Tooltip>
                    }
                  />
                </FlexItem>
              </Flex>
            ) : (
              <SelectableGallery
                selectedID={newProvider?.spec?.type}
                items={providerCardItems}
                onChange={handleTypeChange}
              />
            )}
          </FormGroupWithHelpText>
        </Form>

        {newProvider?.spec?.type && (
          <Form isWidthLimited className="forklift-create-provider-edit-section">
            <FormGroupWithHelpText
              label={t('Provider resource name')}
              isRequired
              fieldId="k8sName"
              helperText={state.validation.name.msg}
              helperTextInvalid={state.validation.name.msg}
              validated={state.validation.name.type}
            >
              <TextInput
                spellCheck="false"
                isRequired
                type="text"
                id="k8sName"
                name="name"
                value={newProvider.metadata.name} // Use the appropriate prop value here
                validated={state.validation.name.type}
                onChange={(value) => handleNameChange(value)} // Call the custom handler method
              />
            </FormGroupWithHelpText>
          </Form>
        )}
      </div>

      <div className="forklift-create-provider-edit-section">
        <EditProvider
          newProvider={newProvider}
          newSecret={newSecret}
          onNewProviderChange={onNewProviderChange}
          onNewSecretChange={onNewSecretChange}
        />
      </div>
    </ModalHOC>
  );
};

export default ProvidersCreateForm;
