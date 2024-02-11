import React, { useReducer } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { MigrationAction } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/MigrationAction';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, ProviderModelRef, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Button,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import { findProviderByID, PlanCreateForm, ProviderVirtualMachinesList } from './components';
import { planCreatePageInitialState, planCreatePageReducer } from './states';

import './PlanCreatePage.style.css';

export const PlanCreatePage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const [filterState, filterDispatch] = useReducer(
    planCreatePageReducer,
    planCreatePageInitialState,
  );

  const [providers] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });

  const defaultNamespace = process?.env?.DEFAULT_NAMESPACE || 'default';

  const providersListURL = getResourceUrl({
    reference: ProviderModelRef,
    namespace: namespace,
  });

  const filteredProviders = providers.filter(
    (provider) =>
      provider.metadata.name.toLowerCase().includes(filterState.nameFilter.toLowerCase()) &&
      (filterState.typeFilters.length === 0 ||
        filterState.typeFilters.includes(provider.spec.type)),
  );

  const selectedProvider =
    filterState.selectedProviderUID !== ''
      ? findProviderByID(filterState.selectedProviderUID, providers)
      : undefined;
  const selectedProviderName = selectedProvider?.metadata?.name;
  const selectedProviderNamespace = selectedProvider?.metadata?.namespace;

  return (
    <div>
      <PageSection variant="light">
        <Alert
          className="co-alert co-alert--margin-top"
          customIcon={<BellIcon />}
          variant="info"
          title={t('How to create a migration plan')}
        >
          <ForkliftTrans>
            To migrate virtual machines select a provider, then select the virtual machines to
            migrate and click the <strong>Create migration plan</strong> button.
          </ForkliftTrans>
        </Alert>

        {!namespace && (
          <Alert
            className="co-alert forklift--create-plan--alert"
            isInline
            variant="warning"
            title={t('Namespace is not defined')}
          >
            <ForkliftTrans>
              This plan will be created in <strong>{defaultNamespace}</strong> namespace, if you
              wish to choose another namespace please cancel, and choose a namespace from the top
              bar.
            </ForkliftTrans>
          </Alert>
        )}

        <Title headingLevel="h2" className="forklift--create-plan--title">
          {t('Select source provider')}
        </Title>

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
            />
          </>
        )}

        <Toolbar>
          <ToolbarContent className="forklift--create-plan--bottom-toolbar">
            <MigrationAction
              {...{
                provider: selectedProvider,
                selectedVms: filterState.selectedVMs,
              }}
            />
            <ToolbarItem>
              <Button onClick={() => history.push(providersListURL)} variant="secondary">
                {t('Cancel')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
    </div>
  );
};

export default PlanCreatePage;
