import React, { FC } from 'react';
import { useHistory } from 'react-router';
import { PlanCreateProgress } from 'src/modules/Plans/views/create';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { LoadingDots } from '@kubev2v/common';
import { Alert, Button, Flex, FlexItem, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import { PlansCreateForm } from './components/PlansCreateForm';
import { startCreate } from './reducer/actions';
import { isDone } from './reducer/helpers';
import { useCreateVmMigrationData } from './ProvidersCreateVmMigrationContext';
import { useFetchEffects } from './useFetchEffects';
import { useSaveEffect } from './useSaveEffect';

const ProvidersCreateVmMigrationPage: FC = () => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const { data } = useCreateVmMigrationData();

  const [state, dispatch, emptyContext] = useFetchEffects({
    data: {
      selectedVms: data.selectedVms,
      provider: data.provider,
    },
  });
  useSaveEffect(state, dispatch);

  const isLoading = state.flow.editingDone && !state.flow.apiError;

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
    <Alert
      className="co-alert co-alert--margin-top"
      isInline
      variant="danger"
      title={t('API Error')}
    >
      {state?.flow?.apiError?.message || state?.flow?.apiError?.toString()}
    </Alert>
  );

  const FormActions = (
    <Flex>
      <FlexItem>
        <Button
          variant="primary"
          isDisabled={
            !!state.flow.apiError ||
            Object.values(state.validation).some((validation) => validation === 'error')
          }
          isLoading={isLoading}
          onClick={() => dispatch(startCreate())}
        >
          {t('Create migration plan')}
        </Button>
      </FlexItem>
      <FlexItem>
        <Button onClick={history.goBack} variant="secondary">
          {t('Cancel')}
        </Button>
      </FlexItem>
    </Flex>
  );

  return (
    <PageSection variant="light">
      <PlansCreateForm
        state={state}
        dispatch={dispatch}
        formAlerts={FormAlerts}
        formActions={FormActions}
      >
        <Alert
          className="co-alert forklift--create-vm-migration-plan--alert"
          customIcon={<BellIcon />}
          variant="info"
          title={t('How to create a migration plan')}
        >
          <ForkliftTrans>
            To migrate virtual machines select target provider, namespace, mappings and click the{' '}
            <strong>Create migration plan</strong> button to crete the plan.
          </ForkliftTrans>
        </Alert>

        <PlanCreateProgress step="migrate" />
      </PlansCreateForm>
    </PageSection>
  );
};

export default ProvidersCreateVmMigrationPage;
