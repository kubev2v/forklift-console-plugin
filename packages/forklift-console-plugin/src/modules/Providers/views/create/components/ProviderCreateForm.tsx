import React, { useReducer } from 'react';
import { Base64 } from 'js-base64';
import { validateK8sName, Validation } from 'src/modules/Providers/utils';
import { SelectableCard } from 'src/modules/Providers/utils/components/Galerry/SelectableCard';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Galerry/SelectableGallery';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderType, V1beta1Provider, V1Secret } from '@kubev2v/types';
import { Flex, FlexItem, Form, FormGroup, TextInput } from '@patternfly/react-core';

import { EditProvider } from './EditProvider';
import { providerCardItems } from './providerCardItems';

export interface ProvidersCreateFormProps {
  newProvider: V1beta1Provider;
  newSecret: V1Secret;
  onNewProviderChange: (V1beta1Provider) => void;
  onNewSecretChange: (V1Secret) => void;
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
      name: 'default',
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
    const validation: Validation =
      !providerNames.includes(trimmedValue) && validateK8sName(trimmedValue) ? 'success' : 'error';

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
    <>
      <div className="forklift-create-provider-edit-section">
        <Form isWidthLimited className="forklift-section-provider-edit">
          <FormGroup
            label={t('Provider Resource Name')}
            isRequired
            fieldId="name"
            helperText={t('Unique Kubernetes resource name identifier')}
            validated={state.validation.name}
            helperTextInvalid={t(
              'Error: Name is required and must be a unique and valid Kubernetes name.',
            )}
          >
            <TextInput
              isRequired
              type="text"
              id="url"
              name="url"
              value={newProvider.metadata.name} // Use the appropriate prop value here
              validated={state.validation.name}
              onChange={(value) => handleNameChange(value)} // Call the custom handler method
            />
          </FormGroup>
        </Form>

        <Form isWidthLimited className="forklift-section-secret-edit">
          <FormGroup label={t('Select provider type')} isRequired fieldId="type">
            {newProvider?.spec?.type ? (
              <Flex>
                <FlexItem>
                  <SelectableCard
                    title={providerCardItems[newProvider?.spec?.type]?.title}
                    content={providerCardItems[newProvider?.spec?.type]?.content}
                    onChange={() => handleTypeChange(null)}
                    isSelected={true}
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
          </FormGroup>
        </Form>
      </div>

      <div className="forklift-create-provider-edit-section">
        <EditProvider
          newProvider={newProvider}
          newSecret={newSecret}
          onNewProviderChange={onNewProviderChange}
          onNewSecretChange={onNewSecretChange}
        />
      </div>
    </>
  );
};

export default ProvidersCreateForm;
