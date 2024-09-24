import React, { useReducer } from 'react';
import { useHistory } from 'react-router';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import ProvidersCreateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationPage';
import { startCreate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { useSaveEffect } from 'src/modules/Providers/views/migrate/useSaveEffect';
import { ForkliftTrans } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, PageSection, Title } from '@patternfly/react-core';
import { Wizard } from '@patternfly/react-core/deprecated';

import { findProviderByID } from './components';
import { planCreatePageInitialState, planCreatePageReducer } from './states';
import { SelectSourceProvider } from './steps';

import './PlanCreatePage.style.css';

export const PlanCreatePage: React.FC<{ namespace: string }> = ({ namespace }) => {
  // Get optional initial state context
  const { data } = useCreateVmMigrationData();
  const history = useHistory();
  const defaultNamespace = process?.env?.DEFAULT_NAMESPACE || 'default';
  const startAtStep = data?.provider !== undefined ? 2 : 1;

  // Init Select source provider form state
  const [filterState, filterDispatch] = useReducer(planCreatePageReducer, {
    ...planCreatePageInitialState,
    selectedProviderUID: data?.provider?.metadata?.uid,
    selectedVMs: data?.selectedVms,
  });

  const [providers] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });
  const selectedProvider =
    filterState.selectedProviderUID !== ''
      ? findProviderByID(filterState.selectedProviderUID, providers)
      : undefined;

  // Init Create migration plan form state
  const [state, dispatch, emptyContext] = useFetchEffects({
    data: { selectedVms: filterState.selectedVMs, provider: selectedProvider || data?.provider },
  });
  useSaveEffect(state, dispatch);

  const steps = [
    {
      id: 'step-1',
      name: 'Select source provider',
      component: (
        <SelectSourceProvider
          namespace={namespace}
          filterState={filterState}
          filterDispatch={filterDispatch}
          providers={providers}
          selectedProvider={selectedProvider}
        />
      ),
      enableNext: filterState?.selectedVMs?.length > 0,
    },
    {
      id: 'step-2',
      name: 'Create migration plan',
      component: (
        <ProvidersCreateVmMigrationPage
          state={state}
          dispatch={dispatch}
          emptyContext={emptyContext}
        />
      ),
      enableNext:
        !emptyContext &&
        !(
          !!state?.flow?.apiError ||
          Object.values(state?.validation || []).some((validation) => validation === 'error')
        ),
      canJumpTo: filterState?.selectedVMs?.length > 0,
      nextButtonText: 'Create migration plan',
    },
  ];

  const title = 'Plans wizard';
  return (
    <>
      <PageSection variant="light">
        {!namespace && (
          <Alert
            className="co-alert forklift--create-plan--alert"
            isInline
            variant="warning"
            title={'Namespace is not defined'}
          >
            <ForkliftTrans>
              This plan will be created in <strong>{defaultNamespace}</strong> namespace, if you
              wish to choose another namespace please cancel, and choose a namespace from the top
              bar.
            </ForkliftTrans>
          </Alert>
        )}

        <Title headingLevel="h2">{'Create migration plan'}</Title>
      </PageSection>

      <PageSection variant="light">
        <Wizard
          className="forklift--create-plan--wizard-appearance-order"
          navAriaLabel={`${title} steps`}
          mainAriaLabel={`${title} content`}
          steps={steps}
          onSave={() => dispatch(startCreate())}
          onClose={() => history.goBack()}
          startAtStep={startAtStep}
        />
      </PageSection>
    </>
  );
};

export default PlanCreatePage;
