import { useCallback, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import { NetworkMapModelRef } from '@forklift-ui/types';
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
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { getResourceUrl } from '@utils/getResourceUrl';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultNetworkMapping } from '../utils/constants';

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
    getFieldState,
    getValues,
    handleSubmit,
  } = form;
  const [createError, setCreateError] = useState<Error>();
  const project = useWatch({
    control,
    name: NetworkMapFieldId.Project,
  });

  const { error } = getFieldState(NetworkMapFieldId.NetworkMap);

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

      navigate(createdNetworkMapUrl)?.catch(() => undefined);
    } catch (err) {
      setCreateError(err as Error);
    }
  }, [getValues, project, trackNetworkMapEvent, navigate]);

  return (
    <FormProvider {...form}>
      <Flex
        alignItems={{ default: 'alignItemsStretch' }}
        className="pf-v6-u-h-100"
        direction={{ default: 'column' }}
        flexWrap={{ default: 'nowrap' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsLg' }}
      >
        <Form className="create-network-map-form">
          <MapNameField />
          <ProjectSelectField />
          <SourceProviderField />
          <TargetProviderField />
          <CreateNetworkMapFieldTable />
          {error?.root && (
            <div className="pf-v6-u-mt-sm">
              <FormErrorHelperText error={error.root} />
            </div>
          )}
        </Form>

        <FlexItem>
          <Stack hasGutter>
            {createError?.message && (
              <Alert
                actionClose={<AlertActionCloseButton onClose={clearError} />}
                title={t('Error creating network map')}
                variant={AlertVariant.danger}
              >
                {createError.message}
              </Alert>
            )}

            <Split hasGutter>
              <Button
                data-testid="network-map-create-button"
                isDisabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                {t('Create')}
              </Button>

              <Button
                onClick={() => {
                  navigate(networkMapsListUrl)?.catch(() => undefined);
                }}
                variant={ButtonVariant.secondary}
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
