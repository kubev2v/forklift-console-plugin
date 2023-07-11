import React, { useReducer } from 'react';
import { useHistory } from 'react-router';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef, V1beta1Provider, V1Secret } from '@kubev2v/types';
import {
  Alert,
  Button,
  Divider,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { useK8sWatchProviderNames } from '../../hooks';
import { getResourceUrl, Validation } from '../../utils';
import { providerAndSecretValidator } from '../../utils/validators/providerAndSecretValidator';

import { ProvidersCreateForm } from './components';
import { providerTemplate, secretTemplate } from './templates';
import { createProvider, createSecret, patchSecretOwner } from './utils';

import './ProvidersCreatePage.style.css';

interface ProvidersCreatePageState {
  newSecret: V1Secret;
  newProvider: V1beta1Provider;
  validationError: Error | null;
  apiError: Error | null;
  validation: {
    name: Validation;
  };
}

export const ProvidersCreatePage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();

  const [providerNames] = useK8sWatchProviderNames({ namespace });

  const initialState: ProvidersCreatePageState = {
    newSecret: {
      ...secretTemplate,
      metadata: { ...secretTemplate.metadata, namespace: namespace || 'default' },
    },
    newProvider: {
      ...providerTemplate,
      metadata: { ...providerTemplate.metadata, namespace: namespace || 'default' },
    },
    validationError: new Error('Missing provider name'),
    apiError: null,
    validation: {
      name: 'default',
    },
  };

  function reducer(
    state: ProvidersCreatePageState,
    action: { type: string; payload?: string | V1Secret | V1beta1Provider },
  ): ProvidersCreatePageState {
    switch (action.type) {
      case 'SET_NEW_SECRET': {
        const value = action.payload as V1beta1Provider;
        let validationError = providerAndSecretValidator(state.newProvider, value);

        if (providerNames.includes(state.newProvider?.metadata?.name)) {
          validationError = new Error('new provider name is not unique');
        }

        if (!state.newProvider?.metadata?.name) {
          validationError = new Error('Missing provider name');
        }

        return {
          ...state,
          validationError: validationError,
          newSecret: value,
          apiError: null,
        };
      }
      case 'SET_NEW_PROVIDER': {
        const value = action.payload as V1beta1Provider;
        let validationError = providerAndSecretValidator(value, state.newSecret);

        if (providerNames.includes(value?.metadata?.name)) {
          validationError = new Error('new provider name is not unique');
        }

        if (!value?.metadata?.name) {
          validationError = new Error('Missing provider name');
        }

        return {
          ...state,
          validationError: validationError,
          newProvider: value,
          apiError: null,
        };
      }
      case 'SET_API_ERROR': {
        const value = action.payload as Error | null;
        return { ...state, apiError: value };
      }
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  if (!state.newSecret) {
    return <span className="text-muted">{t('No credentials found.')}</span>;
  }

  // Handle user edits
  function onNewSecretChange(newValue: V1Secret) {
    // update staged secret with new value
    dispatch({ type: 'SET_NEW_SECRET', payload: newValue });
  }

  // Handle user edits
  function onNewProviderChange(newValue: V1beta1Provider) {
    // update staged provider with new value
    dispatch({ type: 'SET_NEW_PROVIDER', payload: newValue });
  }

  // Handle user clicking "save"
  async function onUpdate() {
    let secret: V1Secret;
    let provider: V1beta1Provider;

    // try to generate a secret with data
    //
    // add generateName using provider name as prefix
    // add createdForProviderType label
    // add url
    try {
      secret = await createSecret(state.newProvider, state.newSecret);
    } catch (err) {
      dispatch({
        type: 'SET_API_ERROR',
        payload: err,
      });

      return;
    }

    // try to create a provider with secret
    // add spec.secret
    try {
      provider = await createProvider(state.newProvider, secret);
    } catch (err) {
      dispatch({
        type: 'SET_API_ERROR',
        payload: err,
      });

      return;
    }

    // set secret ownership using provider uid
    try {
      await patchSecretOwner(provider, secret);
    } catch (err) {
      dispatch({
        type: 'SET_API_ERROR',
        payload: err,
      });

      return;
    }

    // go to providers derails page
    const providerURL = getResourceUrl({
      reference: ProviderModelRef,
      namespace: namespace,
      name: provider.metadata.name,
    });

    history.push(providerURL);
  }

  const providersListURL = getResourceUrl({
    reference: ProviderModelRef,
    namespace: namespace,
  });

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2">{t('Create Provider')}</Title>

        <HelperText className="forklift-create-subtitle">
          <HelperTextItem variant="default">
            {t(
              'Create by using the form or manually entering YAML or JSON definitions, Provider CR stores attributes that enable MTV to connect to and interact with the source and target providers.',
            )}
          </HelperTextItem>
        </HelperText>

        <Flex>
          <FlexItem>
            <Button
              variant="primary"
              onClick={onUpdate}
              isDisabled={state.validationError !== null}
            >
              {t('Create provider')}
            </Button>
          </FlexItem>
          <FlexItem>
            <Button onClick={() => history.push(providersListURL)} variant="secondary">
              {t('Cancel')}
            </Button>
          </FlexItem>
        </Flex>

        <HelperText className="forklift-create-subtitle-errors">
          {state.validationError ? (
            <HelperTextItem variant="indeterminate">
              {state.validationError.toString()}
            </HelperTextItem>
          ) : (
            <HelperTextItem variant="indeterminate">{t('Create new provider')}</HelperTextItem>
          )}
        </HelperText>

        <Divider className="forklift-section-secret-edit" />

        {state.apiError && (
          <Alert
            className="co-alert co-alert--margin-top"
            isInline
            variant="danger"
            title={t('Error')}
          >
            {state.apiError.message || state.apiError.toString()}
          </Alert>
        )}

        {!namespace && (
          <Alert
            className="co-alert co-alert--margin-top"
            isInline
            variant="warning"
            title={t('Namespace is not defined')}
          >
            {t(
              'This provider will be created in the default namespace, if you wish to choose another namespace please cancel, and choose a namespace from the top bar.',
            )}
          </Alert>
        )}

        <ProvidersCreateForm
          newProvider={state.newProvider}
          newSecret={state.newSecret}
          onNewProviderChange={onNewProviderChange}
          onNewSecretChange={onNewSecretChange}
          providerNames={providerNames}
        />
      </PageSection>
    </div>
  );
};

export default ProvidersCreatePage;
