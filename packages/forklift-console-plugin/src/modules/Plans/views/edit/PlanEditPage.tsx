import React, { useEffect, useReducer, useRef } from 'react';
import { PlanEditAction } from 'src/modules/Plans/utils/types/PlanEditAction';
import { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { setAPiError, startUpdate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { isEmpty } from 'src/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { Alert, PageSection, Text, TextContent, Title } from '@patternfly/react-core';
import { Wizard } from '@patternfly/react-core/deprecated';

import { patchPlanMappingsData, patchPlanSpecVms } from '../../utils';
import { findProviderByID } from '../create/components';
import { planCreatePageInitialState, planCreatePageReducer } from '../create/states';
import { SelectSourceProvider } from '../create/steps';
import {
  initialPlanMappingsState,
  planMappingsSectionReducer,
} from '../details/components/UpdateMappings';

import { PlanUpdateForm } from './steps/PlanUpdateForm';

import '../create/PlanCreatePage.style.css';

export const PlanEditPage: React.FC<{
  plan: V1beta1Plan;
  providers: V1beta1Provider[];
  sourceProvider: V1beta1Provider;
  targetProvider: V1beta1Provider;
  projectName: string;
  onClose: () => void;
  selectedVMs: VmData[];
  notFoundPlanVMs: V1beta1PlanSpecVms[];
  editAction: PlanEditAction;
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
}> = ({
  plan,
  providers,
  sourceProvider,
  targetProvider,
  projectName,
  onClose,
  selectedVMs,
  notFoundPlanVMs,
  editAction,
  planNetworkMaps,
  planStorageMaps,
}) => {
  const { t } = useForkliftTranslation();
  const startAtStep = 1;

  // Init Select source provider form state
  const [filterState, filterDispatch] = useReducer(planCreatePageReducer, {
    ...planCreatePageInitialState,
    selectedProviderUID: sourceProvider.metadata.uid,
    selectedVMs: selectedVMs,
  });

  const selectedProvider = findProviderByID(filterState.selectedProviderUID, providers);

  const [state, dispatch, emptyContext] = useFetchEffects({
    data: {
      selectedVms: filterState.selectedVMs,
      provider: selectedProvider,
      targetProvider,
      plan,
      editAction,
    },
  });

  const [planMappingsState, planMappingsDispatch] = useReducer(
    planMappingsSectionReducer,
    initialPlanMappingsState({
      planNetworkMaps,
      planStorageMaps,
      editAction,
      edit: true,
    }),
  );

  useEffect(() => {
    if (planNetworkMaps && planStorageMaps) {
      planMappingsDispatch({
        type: 'SET_PLAN_MAPS',
        payload: { planNetworkMaps, planStorageMaps },
      });
    }
  }, [planNetworkMaps, planStorageMaps]);

  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  useEffect(() => {
    const {
      flow,
      underConstruction: { plan },
    } = state;
    if (!flow.editingDone || !mounted.current) {
      return;
    }

    Promise.all([
      patchPlanSpecVms(plan),
      patchPlanMappingsData(
        planMappingsState.planNetworkMaps,
        planMappingsState.planStorageMaps,
        planMappingsState.updatedNetwork,
        planMappingsState.updatedStorage,
      ),
    ])
      .then(() => onClose())
      .catch((error) => mounted.current && dispatch(setAPiError(error)));
  }, [state.flow.editingDone]);

  const steps = [
    {
      id: 'step-1',
      name: editAction === 'VMS' ? t('Select virtual machines') : t('Select source provider'),
      component: (
        <>
          {!isEmpty(notFoundPlanVMs) && (
            <Alert
              title={t(
                'The following VMs do not exist on the source provider and will be removed from the plan',
              )}
              variant="warning"
            >
              <TextContent className="forklift-providers-list-header__alert">
                <Text component="p">{notFoundPlanVMs.map((vm) => `${vm.name} `)}</Text>
              </TextContent>
            </Alert>
          )}
          <SelectSourceProvider
            projectName={projectName}
            filterState={filterState}
            filterDispatch={filterDispatch}
            state={state}
            dispatch={dispatch}
            providers={providers}
            selectedProvider={selectedProvider}
            hideProviderSection={editAction === 'VMS'}
          />
        </>
      ),
      enableNext: filterState?.selectedVMs?.length > 0,
    },
    {
      id: 'step-2',
      name: editAction === 'VMS' ? t('Update mappings') : t('Update migration plan'),
      component: (
        <PlanUpdateForm
          state={state}
          dispatch={dispatch}
          planMappingsState={planMappingsState}
          planMappingsDispatch={planMappingsDispatch}
          planNetworkMaps={planNetworkMaps}
          planStorageMaps={planStorageMaps}
        >
          <Title headingLevel="h2" className="forklift--create-plan--title">
            {t('Update mappings')}
          </Title>
        </PlanUpdateForm>
      ),
      enableNext:
        !emptyContext &&
        !(
          !!state?.flow?.apiError ||
          Object.values(state?.validation || []).some((validation) => validation === 'error')
        ),
      canJumpTo: filterState?.selectedVMs?.length > 0,
      nextButtonText:
        editAction === 'VMS' ? t('Update virtual machines') : t('Update migration plan'),
    },
  ];

  const title = t('Plans wizard');
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h2">
          {editAction === 'VMS' ? t('Update virtual machines') : t('Update migration plan')}
        </Title>
      </PageSection>

      <PageSection variant="light">
        <Wizard
          className="forklift--create-plan--wizard-appearance-order"
          navAriaLabel={`${title} steps`}
          mainAriaLabel={`${title} content`}
          steps={steps}
          onSave={() => dispatch(startUpdate())}
          onClose={onClose}
          startAtStep={startAtStep}
        />
      </PageSection>
    </>
  );
};

export default PlanEditPage;
