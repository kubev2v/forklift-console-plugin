import { Controller, FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import ProviderSelect from '@components/ProviderSelect/ProviderSelect';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, FormGroup, ModalVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { getObjectRef } from '@utils/helpers/getObjectRef';
import { useForkliftTranslation } from '@utils/i18n';

import {
  MapProviderEditFormFields,
  type MapProvidersEditFormValues,
  type MapProvidersEditProps,
} from './utils/types';

const MapProvidersEdit: ModalComponent<MapProvidersEditProps> = ({
  closeModal,
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
      closeModal();
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
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit providers')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isEmpty(errors) || !isDirty}
      >
        <Form>
          <FormGroup
            isRequired
            label={t('Source provider')}
            fieldId={MapProviderEditFormFields.Source}
          >
            <Controller
              name={MapProviderEditFormFields.Source}
              control={control}
              render={({ field }) => (
                <ProviderSelect
                  ref={field.ref}
                  placeholder={t('Select source provider')}
                  id={MapProviderEditFormFields.Source}
                  testId="map-source-provider-select"
                  namespace={namespace}
                  value={field.value?.metadata?.name ?? ''}
                  onSelect={(_, value) => {
                    field.onChange(value);
                  }}
                />
              )}
              rules={{ required: t('Source provider is required.') }}
            />
          </FormGroup>
          <FormGroup
            isRequired
            label={t('Target provider')}
            fieldId={MapProviderEditFormFields.Destination}
          >
            <Controller
              name={MapProviderEditFormFields.Destination}
              control={control}
              render={({ field }) => (
                <ProviderSelect
                  ref={field.ref}
                  placeholder={t('Select target provider')}
                  id={MapProviderEditFormFields.Destination}
                  testId="map-target-provider-select"
                  namespace={namespace}
                  value={field.value?.metadata?.name ?? ''}
                  onSelect={(_, value) => {
                    field.onChange(value);
                  }}
                  isTarget
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
