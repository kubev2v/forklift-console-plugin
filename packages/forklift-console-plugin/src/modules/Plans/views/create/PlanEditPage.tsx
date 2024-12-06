import React, { useReducer } from 'react';
import { useHistory } from 'react-router';
import { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
// import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import ProvidersCreateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationPage';
import { startCreate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
// import { createInitialState } from 'src/modules/Providers/views/migrate/reducer/createInitialState';
// import { reducer } from 'src/modules/Providers/views/migrate/reducer/reducer';
import { useUpdateEffect } from 'src/modules/Providers/views/migrate/useUpdateEffect';
import { ForkliftTrans } from 'src/utils/i18n';

// import { useImmerReducer } from 'use-immer';
import { ProviderModelGroupVersionKind, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, PageSection, Title } from '@patternfly/react-core';
import { Wizard } from '@patternfly/react-core/deprecated';

// import { findProviderByID } from './components';
import { planCreatePageInitialState, planCreatePageReducer } from './states';
import { SelectSourceProvider } from './steps';

import './PlanCreatePage.style.css';

export const PlanEditPage: React.FC<{
  plan: V1beta1Plan;
  sourceProvider: V1beta1Provider;
  namespace: string;
  onClose?: () => void;
  selectedVMs?: VmData[];
  editAction?: 'PLAN' | 'VMS';
}> = ({ plan, sourceProvider, namespace, onClose, selectedVMs, editAction }) => {
  const mutableConditions = {
    ...plan.status.conditions,
  };
  const mutablePlan: V1beta1Plan = {
    ...plan,
    status: {
      ...plan.status,
      conditions: {
        ...plan.status.conditions,
      },
    },
  };
  Object.keys(mutableConditions).forEach((key) => {
    const item = mutableConditions[key];
    const mutableItem = {
      ...item,
    };
    if (mutableItem.type === 'Succeeded') {
      // Update the status to "False"
      mutableItem.status = 'False';
    }
    mutableConditions[key] = mutableItem;
  });
  mutablePlan.status.conditions = mutableConditions;
  debugger;
  // delete mutablePlan.metadata.resourceVersion;
  const history = useHistory();
  const defaultNamespace = process?.env?.DEFAULT_NAMESPACE || 'default';
  const startAtStep = 1;

  // Init Select source provider form state
  const [filterState, filterDispatch] = useReducer(planCreatePageReducer, {
    ...planCreatePageInitialState,
    selectedProviderUID: sourceProvider.metadata.uid,
    selectedVMs: selectedVMs,
  });
  console.log('filterState', filterState);

  const [providers] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });

  // Init Create migration plan form state
  const [state, dispatch, emptyContext] = useFetchEffects({
    data: {
      selectedVms: filterState.selectedVMs,
      provider: sourceProvider,
      plan: mutablePlan,
      // netMap: mutablePlan.spec.map.network,
      // storageMap: mutablePlan.spec.map.storage,
      editAction,
    },
  });

  // const [state, dispatch] = useImmerReducer(
  //   reducer,
  //   { namespace, sourceProvider, selectedVms, plan, editAction },
  //   createInitialState,
  // );

  console.log('state', state);
  useUpdateEffect(state, dispatch, editAction);

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
          selectedProvider={sourceProvider}
          editAction={editAction}
        />
      ),
      enableNext: filterState?.selectedVMs?.length > 0,
    },
    {
      id: 'step-2',
      name: 'Update migration plan',
      component: (
        <ProvidersCreateVmMigrationPage
          state={state}
          dispatch={dispatch}
          emptyContext={emptyContext}
          editAction={editAction}
        />
      ),
      enableNext:
        !emptyContext &&
        !(
          !!state?.flow?.apiError ||
          Object.values(state?.validation || []).some((validation) => validation === 'error')
        ),
      canJumpTo: filterState?.selectedVMs?.length > 0,
      nextButtonText: 'Update migration plan',
    },
  ];

  const goBack = () => history.goBack();
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
          onClose={onClose || goBack}
          startAtStep={startAtStep}
        />
      </PageSection>
    </>
  );
};

export default PlanEditPage;
