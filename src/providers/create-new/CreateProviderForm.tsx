import { type FC, useCallback, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom-v5-compat';
import { createProvider } from 'src/providers/create/utils/createProvider';
import { createProviderSecret } from 'src/providers/create/utils/createProviderSecret';
import { patchProviderSecretOwner } from 'src/providers/create/utils/patchProviderSecretOwner';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { getProviderDetailsPageUrl } from 'src/providers/utils/getProviderDetailsPageUrl';

import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Form,
  Split,
} from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from './fields/constants';
import NfsDirectoryField from './fields/NfsDirectoryField';
import ProviderNameField from './fields/ProviderNameField';
import ProviderProjectField from './fields/ProviderProjectField';
import ProviderTypeField from './fields/ProviderTypeField';
import { buildOvaProviderResources } from './utils/buildProviderResources';
import { getDefaultFormValues } from './utils/getDefaultFormValues';
import CreateProviderFormContextProvider from './CreateProviderFormContextProvider';
import type { CreateProviderFormData } from './types';

import './CreateProviderForm.style.scss';

const CreateProviderForm: FC = () => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();
  const [apiError, setApiError] = useState<Error | null>(null);

  const form = useForm<CreateProviderFormData>({
    defaultValues: getDefaultFormValues(''),
    mode: 'onChange',
  });

  const {
    control,
    formState: { isSubmitting, isValid },
    handleSubmit,
  } = form;

  const [selectedProject, selectedProviderType] = useWatch({
    control,
    name: [ProviderFormFieldId.ProviderProject, ProviderFormFieldId.ProviderType],
  });

  const onSubmit = useCallback(
    async (formData: CreateProviderFormData) => {
      setApiError(null);

      const providerType = formData[ProviderFormFieldId.ProviderType];
      const namespace = formData[ProviderFormFieldId.ProviderProject];

      trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_STARTED, {
        namespace,
        providerType,
      });

      try {
        const { provider: newProvider, secret: newSecret } = buildOvaProviderResources(formData);
        const secret = await createProviderSecret(newProvider, newSecret);

        if (secret) {
          const provider = await createProvider(newProvider, secret);
          await patchProviderSecretOwner(provider, secret);

          trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_COMPLETED, {
            namespace,
            providerType: provider?.spec?.type,
          });

          const providerURL = getProviderDetailsPageUrl(provider);
          navigate(providerURL);
        }
      } catch (err) {
        trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_FAILED, {
          error: err instanceof Error ? err.message : 'Unknown error',
          namespace,
          providerType,
        });

        setApiError(err as Error);
      }
    },
    [navigate, trackEvent],
  );

  return (
    <FormProvider {...form}>
      <CreateProviderFormContextProvider namespace={selectedProject || ''}>
        <Flex
          direction={{ default: 'column' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsStretch' }}
          flexWrap={{ default: 'nowrap' }}
          spaceItems={{ default: 'spaceItemsLg' }}
          className="pf-v6-u-h-100"
        >
          <Form className="create-provider-form">
            <ProviderProjectField />
            <ProviderTypeField />
            {selectedProviderType && <ProviderNameField />}
            {selectedProviderType === PROVIDER_TYPES.ova && <NfsDirectoryField />}

            {apiError && (
              <Alert
                variant={AlertVariant.danger}
                title={t('Error creating provider')}
                isInline
                className="pf-v6-u-mt-md"
              >
                {apiError.message}
              </Alert>
            )}
          </Form>

          <FlexItem>
            <Split hasGutter>
              <Button
                data-testid="provider-create-button"
                onClick={handleSubmit(onSubmit)}
                isDisabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
              >
                {t('Create provider')}
              </Button>

              <Button
                variant={ButtonVariant.secondary}
                onClick={() => {
                  navigate(-1);
                }}
                data-testid="provider-cancel-button"
              >
                {t('Cancel')}
              </Button>
            </Split>
          </FlexItem>
        </Flex>
      </CreateProviderFormContextProvider>
    </FormProvider>
  );
};

export default CreateProviderForm;
