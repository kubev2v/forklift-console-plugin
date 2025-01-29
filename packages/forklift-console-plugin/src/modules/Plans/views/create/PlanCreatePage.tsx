import React, { FC, useMemo, useReducer } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import ProvidersCreateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationPage';
import { startCreate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { useSaveEffect } from 'src/modules/Providers/views/migrate/useSaveEffect';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  PlanModelRef,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  V1beta1Provider,
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
  const defaultNamespace = process?.env?.DEFAULT_NAMESPACE || 'default';
  const projectName =
    data?.projectName ||
    (activeNamespace === '#ALL_NS#' ? 'openshift-mtv' : activeNamespace) ||
    defaultNamespace;

  const plansListURL = useMemo(() => {
    return getResourceUrl({
      reference: PlanModelRef,
      namespace: namespace,
      namespaced: namespace !== undefined,
    });
  }, [namespace]);

  const providerURL = useMemo(() => {
    return getResourceUrl({
      reference: ProviderModelRef,
      name: data?.provider?.metadata?.name,
      namespace: data?.provider?.metadata?.namespace,
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
    namespaced: true,
    isList: true,
    namespace: namespace || projectName,
  });

  const selectedProvider = findProviderByID(filterState.selectedProviderUID, providers);

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

  const anyValidationError = useMemo(() => {
    return anyValidationErrorExists(state);
  }, [state]);

  const title = t('Plans wizard');

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
          onClose={() =>
            history.push(createPlanFromPlansList ? plansListURL : `${providerURL}/vms`)
          }
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
              nextButtonText: t('Create migration plan'),
              isNextDisabled: emptyContext || !!state?.flow?.apiError || anyValidationError,
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
