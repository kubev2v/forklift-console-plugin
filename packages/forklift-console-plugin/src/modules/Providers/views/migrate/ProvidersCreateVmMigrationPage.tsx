import React from 'react';

import { LoadingDots } from '@kubev2v/common';
import { Alert } from '@patternfly/react-core';

import { PlansCreateForm } from './components/PlansCreateForm';
import { CreateVmMigration, PageAction } from './reducer/actions';
import { isDone } from './reducer/helpers';
import { CreateVmMigrationPageState } from './types';

const ProvidersCreateVmMigrationPage: React.FC<{
  state: CreateVmMigrationPageState;
  dispatch: React.Dispatch<PageAction<CreateVmMigration, unknown>>;
  emptyContext: boolean;
}> = ({ state, dispatch, emptyContext }) => {
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

  return <PlansCreateForm state={state} dispatch={dispatch} formAlerts={FormAlerts} />;
};

export default ProvidersCreateVmMigrationPage;
