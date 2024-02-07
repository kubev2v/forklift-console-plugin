import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Alert, Button, Flex, FlexItem, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import { startCreate } from './actions';
import { PlansCreateForm } from './PlansCreateForm';
import { useFetchEffects } from './useFetchEffects';
import { useSaveEffect } from './useSaveEffect';

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
        <Trans t={t} ns="plugin__forklift-console-plugin">
          To migrate virtual machines select target provider, namespace, mappings and click the{' '}
          <strong>Create</strong> button to crete the plan.
        </Trans>
      </Alert>

      <SectionHeading text={t('Select migration target')} />

      <PlansCreateForm state={state} dispatch={dispatch} />
      {state.flow.apiError && (
        <Alert
          className="co-alert co-alert--margin-top"
          isInline
          variant="danger"
          title={t('Error')}
        >
          {state.flow.apiError.message || state.flow.apiError.toString()}
        </Alert>
      )}
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
