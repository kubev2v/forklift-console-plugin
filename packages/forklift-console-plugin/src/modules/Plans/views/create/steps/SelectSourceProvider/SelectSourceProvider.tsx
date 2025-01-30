import React from 'react';
import { CreateVmMigration, PageAction } from 'src/modules/Providers/views/migrate/reducer/actions';
import { CreateVmMigrationPageState } from 'src/modules/Providers/views/migrate/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Provider } from '@kubev2v/types';
import { Title } from '@patternfly/react-core';

import { PlanCreatePageActionTypes, PlanCreatePageState } from '../../states';

import { PlanCreateForm } from './../../components';
import { MemoizedProviderVirtualMachinesList } from './MemoizedProviderVirtualMachinesList';

export const SelectSourceProvider: React.FC<{
  projectName: string;
  filterState: PlanCreatePageState;
  providers: V1beta1Provider[];
  selectedProvider: V1beta1Provider;
  state: CreateVmMigrationPageState;
  dispatch: React.Dispatch<PageAction<CreateVmMigration, unknown>>;
  filterDispatch: React.Dispatch<PlanCreatePageActionTypes>;
  hideProviderSection?: boolean;
}> = ({
  filterState,
  providers,
  selectedProvider,
  state,
  projectName,
  dispatch,
  filterDispatch,
  hideProviderSection,
}) => {
  const { t } = useForkliftTranslation();

  // Get the ready providers (note: currently forklift does not allow filter be status.phase)
  const readyProviders = providers.filter((p) => p?.status?.phase === 'Ready');

  const filteredProviders = readyProviders.filter(
    (provider) =>
      provider.metadata.name.toLowerCase().includes(filterState.nameFilter.toLowerCase()) &&
      (filterState.typeFilters.length === 0 ||
        filterState.typeFilters.includes(provider.spec.type)),
  );

  const selectedProviderName = selectedProvider?.metadata?.name;
  const selectedProviderNamespace = selectedProvider?.metadata?.namespace;

  return (
    <>
      {!hideProviderSection && (
        <>
          <Title headingLevel="h2">{t('Select source provider')}</Title>

          <PlanCreateForm
            providers={filteredProviders}
            filterState={filterState}
            filterDispatch={filterDispatch}
            dispatch={dispatch}
            state={state}
            projectName={projectName}
          />
        </>
      )}

      {filterState.selectedProviderUID && (
        <>
          <Title headingLevel="h2" className="forklift--create-plan--title">
            {t('Select virtual machines')}
          </Title>

          <MemoizedProviderVirtualMachinesList
            title=""
            name={selectedProviderName}
            namespace={selectedProviderNamespace}
            onSelect={(selectedVms) =>
              filterDispatch({ type: 'UPDATE_SELECTED_VMS', payload: selectedVms })
            }
            initialSelectedIds={filterState.selectedVMs.map((vm) => vm.vm.id)}
            showActions={false}
            selectedCountLabel={(selectedIdCount) =>
              t('{{vmCount}} VMs selected', { vmCount: selectedIdCount })
            }
          />
        </>
      )}
    </>
  );
};
