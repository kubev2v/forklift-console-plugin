import React, { useEffect, useReducer } from 'react';
import { useHistory } from 'react-router';
import {
  planMappingsSectionReducer,
  PlanMappingsSectionState,
} from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappingsSection';
import { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import ProvidersUpdateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersUpdateVmMigrationPage';
import { startUpdate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { useUpdateEffect } from 'src/modules/Providers/views/migrate/useUpdateEffect';
import { ForkliftTrans } from 'src/utils/i18n';

import { V1beta1NetworkMap, V1beta1Plan, V1beta1Provider, V1beta1StorageMap } from '@kubev2v/types';
import { Alert, PageSection, Title } from '@patternfly/react-core';
import { Wizard } from '@patternfly/react-core/deprecated';

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
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
}> = ({
  plan,
  sourceProvider,
  namespace,
  onClose,
  selectedVMs,
  editAction,
  planNetworkMaps,
  planStorageMaps,
}) => {
  const history = useHistory();
  const defaultNamespace = process?.env?.DEFAULT_NAMESPACE || 'default';
  const startAtStep = 1;

  // Init Select source provider form state
  const [filterState, filterDispatch] = useReducer(planCreatePageReducer, {
    ...planCreatePageInitialState,
    selectedProviderUID: sourceProvider.metadata.uid,
    selectedVMs: selectedVMs,
  });

  const initialPlanMappingsState: PlanMappingsSectionState = {
    edit: true,
    dataChanged: false,
    alertMessage: null,
    updatedNetwork: planNetworkMaps?.spec?.map || [],
    updatedStorage: planStorageMaps?.spec?.map || [],
    planNetworkMaps: planNetworkMaps,
    planStorageMaps: planStorageMaps,
  };

  const [planMappingsState, planMappingsDispatch] = useReducer(
    planMappingsSectionReducer,
    initialPlanMappingsState,
  );

  useEffect(() => {
    if (planNetworkMaps && planStorageMaps) {
      planMappingsDispatch({
        type: 'SET_PLAN_MAPS',
        payload: { planNetworkMaps, planStorageMaps },
      });
    }
  }, [planNetworkMaps, planStorageMaps]);

  const [state, dispatch, emptyContext] = useFetchEffects({
    data: {
      selectedVms: filterState.selectedVMs,
      provider: sourceProvider,
      plan,
      editAction,
    },
  });

  useUpdateEffect(state, dispatch, planMappingsState);

  const steps = [
    {
      id: 'step-1',
      name: editAction === 'VMS' ? 'Select virtual machines' : 'Select source provider',
      component: (
        <SelectSourceProvider
          namespace={namespace}
          filterState={filterState}
          filterDispatch={filterDispatch}
          selectedProvider={sourceProvider}
          hideProviderSection={editAction === 'VMS'}
        />
      ),
      enableNext: filterState?.selectedVMs?.length > 0,
    },
    {
      id: 'step-2',
      name: editAction === 'VMS' ? 'Update mappings' : 'Update migration plan',
      component: (
        <ProvidersUpdateVmMigrationPage
          state={state}
          dispatch={dispatch}
          emptyContext={emptyContext}
          editAction={editAction}
          planMappingsState={planMappingsState}
          planMappingsDispatch={planMappingsDispatch}
          planNetworkMaps={planNetworkMaps}
          planStorageMaps={planStorageMaps}
        />
      ),
      enableNext:
        !emptyContext &&
        !(
          !!state?.flow?.apiError ||
          Object.values(state?.validation || []).some((validation) => validation === 'error')
        ),
      canJumpTo: filterState?.selectedVMs?.length > 0,
      nextButtonText: editAction === 'VMS' ? 'Update virtual machines' : 'Update migration plan',
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
          onSave={() => dispatch(startUpdate())}
          onClose={onClose || goBack}
          startAtStep={startAtStep}
        />
      </PageSection>
    </>
  );
};

export default PlanEditPage;
