import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Provider } from '@kubev2v/types';
import { Title } from '@patternfly/react-core';

import { PlanCreatePageActionTypes, PlanCreatePageState } from '../../states';

import { PlanCreateForm, ProviderVirtualMachinesList } from './../../components';

export const SelectSourceProvider: React.FC<{
  namespace: string;
  filterState: PlanCreatePageState;
  filterDispatch: React.Dispatch<PlanCreatePageActionTypes>;
  providers: V1beta1Provider[];
  selectedProvider: V1beta1Provider;
}> = ({ filterState, filterDispatch, providers, selectedProvider }) => {
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
      <Title headingLevel="h2">{t('Select source provider')}</Title>

      <PlanCreateForm
        providers={filteredProviders}
        filterState={filterState}
        filterDispatch={filterDispatch}
      />

      {filterState.selectedProviderUID && (
        <>
          <Title headingLevel="h2" className="forklift--create-plan--title">
            {t('Select virtual machines')}
          </Title>

          <ProviderVirtualMachinesList
            title=""
            name={selectedProviderName}
            namespace={selectedProviderNamespace}
            onSelect={(selectedVms) =>
              filterDispatch({ type: 'UPDATE_SELECTED_VMS', payload: selectedVms })
            }
            initialSelectedIds={filterState.selectedVMs.map((vm) => vm.vm.id)}
            showActions={false}
          />
        </>
      )}
    </>
  );
};
