import React, { FC, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useForkliftTranslation } from 'src/utils/i18n';
import { useImmerReducer } from 'use-immer';

import { ProviderModelGroupVersionKind, ProviderModelRef, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem, PageSection, Title } from '@patternfly/react-core';

import { useToggle } from '../../hooks';
import { getResourceUrl } from '../../utils';

import { setAvailableProviders } from './actions';
import { PlansCreateForm } from './PlansCreateForm';
import { useCreateVmMigrationData } from './ProvidersCreateVmMigrationContext';
import { createInitialState, reducer } from './reducer';

const ProvidersCreateVmMigrationPage: FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();

  const { data: { selectedVms = [], provider: sourceProvider = undefined } = {} } =
    useCreateVmMigrationData();
  // error state - the page was entered directly without choosing the VMs
  const emptyContext = !selectedVms?.length || !sourceProvider;
  // error recovery - redirect to provider list
  useEffect(() => {
    if (emptyContext) {
      history.push(
        getResourceUrl({
          reference: ProviderModelRef,
          namespace: namespace,
        }),
      );
    }
  }, [emptyContext]);

  const [state, dispatch] = useImmerReducer(
    reducer,
    { namespace, sourceProvider, selectedVms },
    createInitialState,
  );

  const [providers] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  useEffect(() => dispatch(setAvailableProviders(providers ?? [])), [providers]);

  const [isLoading, toggleIsLoading] = useToggle();
  const onUpdate = toggleIsLoading;

  if (emptyContext) {
    // display empty node and wait for redirect triggered from useEffect
    // the redirect should be triggered right after the first render()
    // so any "empty page" would only "blink"
    return <></>;
  }

  return (
    <PageSection>
      <Title headingLevel="h2">{t('Create Plan')}</Title>

      <PlansCreateForm state={state} dispatch={dispatch} />

      <Flex>
        <FlexItem>
          <Button variant="primary" isDisabled={true} isLoading={isLoading}>
            {t('Create and edit')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={onUpdate} isDisabled={true} isLoading={isLoading}>
            {t('Create and start')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button onClick={history.goBack} variant="secondary">
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default ProvidersCreateVmMigrationPage;
