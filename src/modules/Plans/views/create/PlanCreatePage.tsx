import React, { type FC, useMemo, useReducer } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import ProvidersCreateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationPage';
import {
  SET_AVAILABLE_SOURCE_NETWORKS,
  SET_AVAILABLE_SOURCE_STORAGES,
  startCreate,
} from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { useSaveEffect } from 'src/modules/Providers/views/migrate/useSaveEffect';
import { Namespace } from 'src/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';
import { getDefaultNamespace } from 'src/utils/namespaces';

import {
  PlanModelRef,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title, Wizard, WizardStep } from '@patternfly/react-core';

import { anyValidationErrorExists } from '../../utils';

import { findProviderByID } from './components';
import { planCreatePageInitialState, planCreatePageReducer } from './states';
import { SelectSourceProvider } from './steps';
import { validateSourceProviderStep } from './utils';

import './PlanCreatePage.style.css';

export const PlanCreatePage: FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  // Get optional initial state context
  const { data } = useCreateVmMigrationData();
  const history = useHistory();
  const createPlanFromPlansList = !(data?.provider !== undefined);
  const [activeNamespace, setActiveNamespace] = useActiveNamespace();
  const defaultNamespace = getDefaultNamespace();
  const projectName =
    data?.projectName ||
    (activeNamespace === Namespace.AllProjects ? defaultNamespace : activeNamespace);

  const plansListURL = useMemo(() => {
    return getResourceUrl({
      namespace: activeNamespace,
      namespaced: true,
      reference: PlanModelRef,
    });
  }, [activeNamespace]);

  const providerURL = useMemo(() => {
    return getResourceUrl({
      name: data?.provider?.metadata?.name,
      namespace: data?.provider?.metadata?.namespace,
      reference: ProviderModelRef,
    });
  }, [data?.provider]);

  // Init Select source provider form state
  const [filterState, filterDispatch] = useReducer(planCreatePageReducer, {
    ...planCreatePageInitialState,
    selectedProviderUID: data?.provider?.metadata?.uid,
    selectedVMs: data?.selectedVms,
  });

  const [providers] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace: namespace || projectName,
    namespaced: true,
  });

  const selectedProvider =
    filterState.selectedProviderUID !== ''
      ? findProviderByID(filterState.selectedProviderUID, providers)
      : undefined;

  // Init Create migration plan form state
  const [state, dispatch, emptyContext] = useFetchEffects({
    data: {
      planName: data?.planName,
      projectName,
      provider: selectedProvider || data?.provider,
      selectedVms: filterState.selectedVMs,
    },
  });

  useSaveEffect(state, dispatch);

  const isFirstStepValid = React.useMemo(
    () => validateSourceProviderStep(state, filterState),
    [state, filterState],
  );

  const anyValidationError = useMemo(() => {
    return anyValidationErrorExists(state);
  }, [state]);

  const title = t('Plans wizard');
  const { initialLoading } = state.flow;

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h2">{'Create migration plan'}</Title>
      </PageSection>
      <PageSection
        hasOverflowScroll={true}
        variant="light"
        className="forklift--create-plan--wizard-container"
      >
        <Wizard
          className="forklift--create-plan--wizard-content"
          shouldFocusContent
          title={title}
          onClose={() => {
            history.push(createPlanFromPlansList ? plansListURL : `${providerURL}/vms`);
          }}
          onSave={() => {
            setActiveNamespace(state.underConstruction.projectName);
            dispatch(startCreate());
          }}
        >
          <WizardStep
            name={t('Select source provider')}
            id="step-1"
            footer={{ isNextDisabled: !isFirstStepValid }}
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
            isDisabled={!isFirstStepValid}
            footer={{
              isNextDisabled:
                emptyContext ||
                Boolean(state?.flow?.apiError) ||
                anyValidationError ||
                !initialLoading[SET_AVAILABLE_SOURCE_NETWORKS] ||
                !initialLoading[SET_AVAILABLE_SOURCE_STORAGES],
              nextButtonText: t('Create migration plan'),
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
