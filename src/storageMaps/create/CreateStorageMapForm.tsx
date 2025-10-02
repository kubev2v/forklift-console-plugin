import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { StorageMapModelRef } from '@kubev2v/types';
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

import { defaultStorageMapping, StorageMapFieldId } from '../constants';

import CreateStorageMapFieldTable from './fields/CreateStorageMapFieldTable';
import MapNameField from './fields/MapNameField';
import ProjectSelectField from './fields/ProjectSelectField';
import SourceProviderField from './fields/SourceProviderField';
import TargetProviderField from './fields/TargetProviderField';
import { createStorageMap } from './utils/createStorageMap';
import type { CreateStorageMapFormData } from './types';

import './CreateStorageMapForm.style.scss';

const CreateStorageMapForm: React.FC = () => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();

  const form = useForm<CreateStorageMapFormData>({
    defaultValues: { [StorageMapFieldId.StorageMap]: [defaultStorageMapping] },
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
    name: StorageMapFieldId.Project,
  });

  const storageMapsListUrl = getResourceUrl({
    namespace: project,
    reference: StorageMapModelRef,
  });

  const onSubmit = async () => {
    setCreateError(undefined);

    const { mapName, sourceProvider, storageMap, targetProvider } = getValues();

    const trackStorageMapEvent = (eventType: string, properties = {}) => {
      trackEvent(eventType, { ...properties, creationMethod: CreationMethod.Form });
    };

    try {
      const createdStorageMap = await createStorageMap({
        mappings: storageMap,
        name: mapName,
        project,
        sourceProvider,
        targetProvider,
        trackEvent: trackStorageMapEvent,
      });

      const createdStorageMapUrl = getResourceUrl({
        name: createdStorageMap.metadata?.name,
        namespace: createdStorageMap.metadata?.namespace,
        reference: StorageMapModelRef,
      });

      // Navigate to the created storage map
      navigate(createdStorageMapUrl);
    } catch (error) {
      setCreateError(error as Error);
    }
  };

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
        <Form className="create-storage-map-form">
          <MapNameField />
          <ProjectSelectField />
          <SourceProviderField />
          <TargetProviderField />
          <CreateStorageMapFieldTable />
        </Form>

        <FlexItem>
          <Stack hasGutter>
            {createError?.message && (
              <Alert
                variant={AlertVariant.danger}
                title={t('Error creating storage map')}
                actionClose={
                  <AlertActionCloseButton
                    onClose={() => {
                      setCreateError(undefined);
                    }}
                  />
                }
              >
                {createError.message}
              </Alert>
            )}

            <Split hasGutter>
              <Button
                onClick={handleSubmit(onSubmit)}
                isDisabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
              >
                {t('Create')}
              </Button>

              <Button
                variant={ButtonVariant.secondary}
                onClick={() => {
                  navigate(storageMapsListUrl);
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

export default CreateStorageMapForm;
