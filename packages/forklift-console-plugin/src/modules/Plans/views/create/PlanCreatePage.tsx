import React, { useReducer } from 'react';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import ProvidersCreateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationPage';
import { startCreate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { useSaveEffect } from 'src/modules/Providers/views/migrate/useSaveEffect';

import {
  PlanModelRef,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  V1beta1Provider,
} from '@kubev2v/types';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title, Wizard, WizardStep } from '@patternfly/react-core';

import { findProviderByID } from './components';
import { planCreatePageInitialState, planCreatePageReducer } from './states';
import { SelectSourceProvider } from './steps';

import './PlanCreatePage.style.css';

export const PlanCreatePage: React.FC<{ namespace: string }> = ({ namespace }) => {
  // Get optional initial state context
  const { data } = useCreateVmMigrationData();
  const createPlanFromPlansList = data?.provider !== undefined ? false : true;
  const startAtStep = createPlanFromPlansList ? 1 : 2;
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();
  const defaultNamespace = process?.env?.DEFAULT_NAMESPACE || 'default';
  const projectName =
    data?.projectName ||
    (activeNamespace === '#ALL_NS#' ? 'openshift-mtv' : activeNamespace) ||
    defaultNamespace;

  const plansListURL = getResourceUrl({
    reference: PlanModelRef,
    namespace: namespace,
    namespaced: namespace !== undefined,
  });

  const providerURL = getResourceUrl({
    reference: ProviderModelRef,
    name: data?.provider?.metadata?.name,
    namespace: data?.provider?.metadata?.namespace,
  });

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

  const anyValidationError = Object.values(state?.validation || []).some(
    (validation) => validation === 'error',
  );

  const planNameValidationDefault = state?.validation?.planName === 'default';

  const title = 'Plans wizard';

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h2">{'Create migration plan'}</Title>
      </PageSection>
      <PageSection variant="light" className="forklift--create-plan--wizard-container">
        <Wizard
          className="forklift--create-plan--wizard-content"
          shouldFocusContent
          title={title}
          startIndex={startAtStep}
          onClose={() =>
            window.location.replace(createPlanFromPlansList ? plansListURL : `${providerURL}/vms`)
          }
          onSave={() => {
            setActiveNamespace(state.underConstruction.projectName);
            dispatch(startCreate());
          }}
        >
          <WizardStep
            name="Select source provider"
            id="step-1"
            footer={{ isNextDisabled: !filterState?.selectedVMs?.length }}
          >
            <SelectSourceProvider
              projectName={projectName}
              filterState={filterState}
              filterDispatch={filterDispatch}
              dispatch={dispatch}
              state={state}
              providers={providers}
              selectedProvider={selectedProvider}
            />
          </WizardStep>
          <WizardStep
            name="Create migration plan"
            id="step-2"
            isDisabled={!filterState?.selectedVMs?.length}
            footer={{
              nextButtonText: 'Create migration plan',
              isNextDisabled:
                emptyContext ||
                !!state?.flow?.apiError ||
                anyValidationError ||
                planNameValidationDefault,
            }}
          >
            <ProvidersCreateVmMigrationPage
              state={state}
              dispatch={dispatch}
              emptyContext={emptyContext}
            />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};

export default PlanCreatePage;
