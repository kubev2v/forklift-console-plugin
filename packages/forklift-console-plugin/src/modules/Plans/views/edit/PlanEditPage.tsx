import React, { useEffect, useReducer } from 'react';
import { PlanEditAction } from 'src/modules/Plans/utils/types/PlanEditAction';
import {
  planMappingsSectionReducer,
  PlanMappingsSectionState,
} from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappingsSection';
import { getVMMigrationStatus } from 'src/modules/Plans/views/details/tabs/VirtualMachines/Migration/MigrationVirtualMachinesList';
import { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import ProvidersUpdateVmMigrationPage from 'src/modules/Providers/views/migrate/ProvidersUpdateVmMigrationPage';
import { startUpdate } from 'src/modules/Providers/views/migrate/reducer/actions';
import { useFetchEffects } from 'src/modules/Providers/views/migrate/useFetchEffects';
import { useUpdateEffect } from 'src/modules/Providers/views/migrate/useUpdateEffect';
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

import { findProviderByID } from '../create/components';
import { planCreatePageInitialState, planCreatePageReducer } from '../create/states';
import { SelectSourceProvider } from '../create/steps';

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

  const migrationVms = plan?.status?.migration?.vms;
  const migratedVmIds = migrationVms?.reduce((migrated, vm) => {
    if (getVMMigrationStatus(vm) === 'Succeeded') {
      migrated.push(vm.id);
    }
    return migrated;
  }, []);

  // Init Select source provider form state
  const [filterState, filterDispatch] = useReducer(planCreatePageReducer, {
    ...planCreatePageInitialState,
    selectedProviderUID: sourceProvider.metadata.uid,
    selectedVMs: selectedVMs,
  });

  const selectedProvider =
    filterState.selectedProviderUID !== ''
      ? findProviderByID(filterState.selectedProviderUID, providers)
      : undefined;

  const [state, dispatch, emptyContext] = useFetchEffects({
    data: {
      selectedVms: filterState.selectedVMs,
      provider: selectedProvider,
      targetProvider,
      plan,
      editAction,
    },
  });

  const initialPlanMappingsState: PlanMappingsSectionState = {
    edit: true,
    dataChanged: false,
    alertMessage: null,
    updatedNetwork: planNetworkMaps?.spec?.map || [],
    updatedStorage: planStorageMaps?.spec?.map || [],
    planNetworkMaps: planNetworkMaps,
    planStorageMaps: planStorageMaps,
    editAction,
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

  useUpdateEffect(state, dispatch, planMappingsState, onClose);

  const steps = [
    {
      id: 'step-1',
      name: editAction === 'VMS' ? t('Select virtual machines') : t('Select source provider'),
      component: (
        <>
          {notFoundPlanVMs.length > 0 && (
            <Alert
              title="The following VMs do not exist on the source provider and will be removed from the plan"
              variant="danger"
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
            disabledVmIds={migratedVmIds}
          />
        </>
      ),
      enableNext: filterState?.selectedVMs?.length > 0,
    },
    {
      id: 'step-2',
      name: editAction === 'VMS' ? t('Update mappings') : t('Update migration plan'),
      component: (
        <ProvidersUpdateVmMigrationPage
          state={state}
          dispatch={dispatch}
          emptyContext={emptyContext}
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
      nextButtonText:
        editAction === 'VMS' ? t('Update virtual machines') : t('Update migration plan'),
    },
  ];

  const title = 'Plans wizard';
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h2">
          {editAction === 'VMS' ? 'Update virtual machines' : 'Update migration plan'}
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
