import React, { useReducer } from 'react';
import { useHistory } from 'react-router';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import ProvidersCreateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationPage';
import { startCreate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { useSaveEffect } from 'src/modules/Providers/views/migrate/useSaveEffect';

import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title } from '@patternfly/react-core';
import { Wizard } from '@patternfly/react-core/deprecated';

import { findProviderByID } from './components';
import { planCreatePageInitialState, planCreatePageReducer } from './states';
import { SelectSourceProvider } from './steps';
import { validateSourceProviderStep } from './utils';

import './PlanCreatePage.style.css';

export const PlanCreatePage: React.FC<{ namespace: string }> = ({ namespace }) => {
  // Get optional initial state context
  const { data } = useCreateVmMigrationData();
  const history = useHistory();
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();
  const defaultNamespace = process?.env?.DEFAULT_NAMESPACE || 'default';
  const projectName =
    data?.projectName ||
    (activeNamespace === '#ALL_NS#' ? 'openshift-mtv' : activeNamespace) ||
    defaultNamespace;

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
    data: {
      projectName,
      selectedVms: filterState.selectedVMs,
      provider: selectedProvider || data?.provider,
      planName: data?.planName,
    },
  });
  useSaveEffect(state, dispatch);

  const isFirstStepValid = React.useMemo(
    () => validateSourceProviderStep(state, filterState),
    [state, filterState],
  );

  const steps = [
    {
      id: 'step-1',
      name: 'Select source provider',
      component: (
        <SelectSourceProvider
          projectName={projectName}
          filterState={filterState}
          filterDispatch={filterDispatch}
          dispatch={dispatch}
          state={state}
          providers={providers}
          selectedProvider={selectedProvider}
        />
      ),
      enableNext: isFirstStepValid,
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
      canJumpTo: isFirstStepValid,
      nextButtonText: 'Create migration plan',
    },
  ];

  const title = 'Plans wizard';
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h2">{'Create migration plan'}</Title>
      </PageSection>

      <PageSection variant="light">
        <Wizard
          className="forklift--create-plan--wizard-appearance-order"
          navAriaLabel={`${title} steps`}
          mainAriaLabel={`${title} content`}
          steps={steps}
          onSave={() => {
            setActiveNamespace(state.underConstruction.projectName);
            dispatch(startCreate());
          }}
          onClose={() => history.goBack()}
        />
      </PageSection>
    </>
  );
};

export default PlanCreatePage;
