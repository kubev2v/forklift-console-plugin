import React, { FC } from 'react';
import { useHistory } from 'react-router';
import SectionHeading from 'src/components/headers/SectionHeading';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { Alert, AlertVariant, Button, Flex, FlexItem, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import { PlansCreateForm } from './components/PlansCreateForm';
import { StateAlerts } from './components/StateAlerts';
import { startCreate } from './reducer/actions';
import { GeneralAlerts } from './types';
import { useFetchEffects } from './useFetchEffects';
import { useSaveEffect } from './useSaveEffect';

const generalMessages = (
  t: (key: string) => string,
): { [key in GeneralAlerts]: { title: string; body: string } } => ({
  NEXT_VALID_PROVIDER_SELECTED: { title: t('Error'), body: t('No target provider exists ') },
});

const ProvidersCreateVmMigrationPage: FC = () => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const [state, dispatch, emptyContext] = useFetchEffects();
  useSaveEffect(state, dispatch);

  const isLoading = state.flow.editingDone && !state.flow.apiError;

  if (emptyContext) {
    // display empty node and wait for redirect triggered from useEffect
    // the redirect should be triggered right after the first render()
    // so any "empty page" would only "blink"
    return <></>;
  }

  return (
    <PageSection variant="light">
      <Alert
        className="co-alert forklift--create-vm-migration-plan--alert"
        customIcon={<BellIcon />}
        variant="info"
        title={t('How to create a migration plan')}
      >
        <ForkliftTrans>
          To migrate virtual machines select target provider, namespace, mappings and click the{' '}
          <strong>Create</strong> button to crete the plan.
        </ForkliftTrans>
      </Alert>

      <SectionHeading text={t('Select migration target')} />

      <PlansCreateForm state={state} dispatch={dispatch} />
      {state.flow.apiError && (
        <Alert
          className="co-alert co-alert--margin-top"
          isInline
          variant="danger"
          title={t('API Error')}
        >
          {state.flow.apiError.message || state.flow.apiError.toString()}
        </Alert>
      )}
      <StateAlerts
        variant={AlertVariant.danger}
        messages={Array.from(state.alerts.general.errors).map((key) => ({
          key,
          ...generalMessages(t)[key],
        }))}
      />
      <Flex>
        <FlexItem>
          <Button
            variant="primary"
            isDisabled={Object.values(state.validation).some(
              (validation) => validation === 'error',
            )}
            isLoading={isLoading}
            onClick={() => dispatch(startCreate())}
          >
            {t('Create and edit')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" isDisabled={true} isLoading={isLoading}>
            {t('Create and start')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button onClick={history.goBack} variant="secondary">
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default ProvidersCreateVmMigrationPage;
