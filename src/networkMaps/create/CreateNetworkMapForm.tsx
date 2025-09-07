import { useCallback, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { NetworkMapModelRef } from '@kubev2v/types';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Form,
  Split,
  Stack,
} from '@patternfly/react-core';
import { CreationMethod } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultNetworkMapping, NetworkMapFieldId } from '../constants';

import CreateNetworkMapFieldTable from './fields/CreateNetworkMapFieldTable';
import MapNameField from './fields/MapNameField';
import ProjectSelectField from './fields/ProjectSelectField';
import SourceProviderField from './fields/SourceProviderField';
import TargetProviderField from './fields/TargetProviderField';
import { createNetworkMap } from './utils/createNetworkMap';
import type { CreateNetworkMapFormData } from './types';

import './CreateNetworkMapForm.style.scss';

const CreateNetworkMapForm: React.FC = () => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();

  const form = useForm<CreateNetworkMapFormData>({
    defaultValues: { [NetworkMapFieldId.NetworkMap]: [defaultNetworkMapping] },
    mode: 'onChange',
  });
  const {
    control,
    formState: { isSubmitting, isValid },
    getValues,
    handleSubmit,
  } = form;
  const [createError, setCreateError] = useState<Error>();
  const project = useWatch({
    control,
    name: NetworkMapFieldId.Project,
  });

  const networkMapsListUrl = getResourceUrl({
    namespace: project,
    reference: NetworkMapModelRef,
  });

  const trackNetworkMapEvent = useCallback(
    (eventType: string, properties = {}) => {
      trackEvent(eventType, { ...properties, creationMethod: CreationMethod.Form });
    },
    [trackEvent],
  );

  const clearError = useCallback(() => {
    setCreateError(undefined);
  }, []);

  const onSubmit = useCallback(async () => {
    setCreateError(undefined);

    const { mapName, networkMap, sourceProvider, targetProvider } = getValues();

    try {
      const createdNetworkMap = await createNetworkMap({
        mappings: networkMap,
        name: mapName,
        project,
        sourceProvider,
        targetProvider,
        trackEvent: trackNetworkMapEvent,
      });

      const createdNetworkMapUrl = getResourceUrl({
        name: createdNetworkMap.metadata?.name,
        namespace: createdNetworkMap.metadata?.namespace,
        reference: NetworkMapModelRef,
      });

      navigate(createdNetworkMapUrl);
    } catch (error) {
      setCreateError(error as Error);
    }
  }, [getValues, project, trackNetworkMapEvent, navigate]);

  return (
    <FormProvider {...form}>
      <Flex
        direction={{ default: 'column' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsStretch' }}
        flexWrap={{ default: 'nowrap' }}
        spaceItems={{ default: 'spaceItemsLg' }}
        className="pf-v5-u-h-100"
      >
        <Form className="create-network-map-form">
          <MapNameField />
          <ProjectSelectField />
          <SourceProviderField />
          <TargetProviderField />
          <CreateNetworkMapFieldTable />
        </Form>

        <FlexItem>
          <Stack hasGutter>
            {createError?.message && (
              <Alert
                variant={AlertVariant.danger}
                title={t('Error creating network map')}
                actionClose={<AlertActionCloseButton onClose={clearError} />}
              >
                {createError.message}
              </Alert>
            )}

            <Split hasGutter>
              <Button
                data-testid="network-map-create-button"
                onClick={handleSubmit(onSubmit)}
                isDisabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
              >
                {t('Create')}
              </Button>

              <Button
                variant={ButtonVariant.secondary}
                onClick={() => {
                  navigate(networkMapsListUrl);
                }}
              >
                {t('Cancel')}
              </Button>
            </Split>
          </Stack>
        </FlexItem>
      </Flex>
    </FormProvider>
  );
};

export default CreateNetworkMapForm;
