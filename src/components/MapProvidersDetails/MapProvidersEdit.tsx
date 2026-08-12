import { Controller, FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, FormGroup, ModalVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { getObjectRef } from '@utils/helpers/getObjectRef';
import { useForkliftTranslation } from '@utils/i18n';

import {
  MapProviderEditFormFields,
  type MapProvidersEditFormValues,
  type MapProvidersEditProps,
} from './utils/types';

const MapProvidersEdit: OverlayComponent<MapProvidersEditProps> = ({
  closeOverlay,
  destinationProvider,
  model,
  namespace,
  obj,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<MapProvidersEditFormValues>({
    defaultValues: {
      [MapProviderEditFormFields.Destination]: destinationProvider,
      [MapProviderEditFormFields.Source]: sourceProvider,
    },
    mode: 'onChange',
  });

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
  } = methods;

  const onSubmit = async (formData: MapProvidersEditFormValues) => {
    if (!isDirty) {
      closeOverlay();
      return;
    }
    const { destination, source } = formData;

    const op = isEmpty(obj?.spec?.provider) ? ADD : REPLACE;
    const updatedProvider = {
      destination: getObjectRef(destination),
      source: getObjectRef(source),
    };

    await k8sPatch({
      data: [
        {
          op,
          path: '/spec/provider',
          value: updatedProvider,
        },
      ],
      model,
      resource: obj,
    });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        closeOverlay={closeOverlay}
        isDisabled={!isEmpty(errors) || !isDirty}
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit providers')}
        variant={ModalVariant.medium}
      >
        <Form>
          <FormGroup
            fieldId={MapProviderEditFormFields.Source}
            isRequired
            label={t('Source provider')}
          >
            <Controller
              control={control}
              name={MapProviderEditFormFields.Source}
              render={({ field }) => (
                <ProviderSelect
                  id={MapProviderEditFormFields.Source}
                  namespace={namespace}
                  onSelect={(_, value) => {
                    field.onChange(value);
                  }}
                  placeholder={t('Select source provider')}
                  ref={field.ref}
                  testId="map-source-provider-select"
                  value={field.value?.metadata?.name ?? ''}
                />
              )}
              rules={{ required: t('Source provider is required.') }}
            />
          </FormGroup>
          <FormGroup
            fieldId={MapProviderEditFormFields.Destination}
            isRequired
            label={t('Target provider')}
          >
            <Controller
              control={control}
              name={MapProviderEditFormFields.Destination}
              render={({ field }) => (
                <ProviderSelect
                  id={MapProviderEditFormFields.Destination}
                  isTarget
                  namespace={namespace}
                  onSelect={(_, value) => {
                    field.onChange(value);
                  }}
                  placeholder={t('Select target provider')}
                  ref={field.ref}
                  testId="map-target-provider-select"
                  value={field.value?.metadata?.name ?? ''}
                />
              )}
              rules={{ required: t('Target provider is required.') }}
            />
          </FormGroup>
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default MapProvidersEdit;
