import React from 'react';
import { PlanMappingsSectionState } from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappingsSection';

import { LoadingDots } from '@kubev2v/common';
import { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';
import { Alert } from '@patternfly/react-core';

import { PlansUpdateForm } from './components/PlansUpdateForm';
import { CreateVmMigration, PageAction } from './reducer/actions';
import { isDone } from './reducer/helpers';
import { CreateVmMigrationPageState } from './types';

const ProvidersUpdateVmMigrationPage: React.FC<{
  state: CreateVmMigrationPageState;
  dispatch: React.Dispatch<PageAction<CreateVmMigration, unknown>>;
  emptyContext: boolean;
  planMappingsState: PlanMappingsSectionState;
  planMappingsDispatch: React.Dispatch<{
    type: string;
    payload?;
  }>;
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
}> = ({
  state,
  dispatch,
  emptyContext,
  planMappingsState,
  planMappingsDispatch,
  planNetworkMaps,
  planStorageMaps,
}) => {
  if (emptyContext) {
    // display empty node and wait for redirect triggered from useEffect
    // the redirect should be triggered right after the first render()
    // so any "empty page" would only "blink"
    return <></>;
  }

  if (!isDone(state.flow.initialLoading) && !state.flow.apiError) {
    return <LoadingDots />;
  }

  const FormAlerts = state.flow.apiError && (
    <Alert className="co-alert co-alert--margin-top" isInline variant="danger" title={'API Error'}>
      {state?.flow?.apiError?.message || state?.flow?.apiError?.toString()}
    </Alert>
  );

  return (
    <PlansUpdateForm
      state={state}
      dispatch={dispatch}
      formAlerts={FormAlerts}
      planMappingsState={planMappingsState}
      planMappingsDispatch={planMappingsDispatch}
      planNetworkMaps={planNetworkMaps}
      planStorageMaps={planStorageMaps}
    />
  );
};

export default ProvidersUpdateVmMigrationPage;
