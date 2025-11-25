import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import {
  defaultNetworkMapping,
  NetworkMapFieldId,
  networkMapFieldLabels,
} from 'src/networkMaps/constants';
import InventorySourceNetworkField from 'src/networkMaps/create/fields/InventorySourceNetworkField';
import TargetNetworkField from 'src/networkMaps/create/fields/TargetNetworkField';
import { validateNetworkMaps } from 'src/networkMaps/create/fields/utils';
import { buildNetworkMappings } from 'src/networkMaps/create/utils/buildNetworkMappings';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import useTargetNetworks from 'src/utils/hooks/useTargetNetworks';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { NetworkMapModel } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { NetworkEditFormValues, NetworkMapEditProps } from './utils/types';

const NetworkMapEdit: ModalComponent<NetworkMapEditProps> = ({
  closeModal,
  destinationProvider,
  initialMappings,
  namespace,
  networkMap,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const methods = useForm<NetworkEditFormValues>({
    defaultValues: {
      networkMap: initialMappings,
    },
  });

  const {
    control,
    formState: { isDirty, isSubmitting, isValid },
    handleSubmit,
    setValue,
    trigger,
  } = methods;

  const {
    append,
    fields: networkMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate: (values) => validateNetworkMaps(values),
    },
  });

  const [sourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [targetNetworks, targetNetworksLoading, targetNetworksError] = useTargetNetworks(
    destinationProvider,
    namespace,
  );
  const loadError = sourceNetworksError ?? targetNetworksError;

  const onSubmit = async (formData: NetworkEditFormValues) => {
    if (!isDirty) {
      closeModal();
      return;
    }

    const op = isEmpty(networkMap?.spec?.map) ? ADD : REPLACE;

    await k8sPatch({
      data: [
        {
          op,
          path: '/spec/map',
          value: buildNetworkMappings(formData.networkMap, sourceProvider),
        },
      ],
      model: NetworkMapModel,
      resource: networkMap,
    });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit providers')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isValid || !isDirty}
      >
        <FieldBuilderTable
          headers={[
            {
              isRequired: true,
              label: networkMapFieldLabels[NetworkMapFieldId.SourceNetwork],
              width: 45,
            },
            {
              isRequired: true,
              label: networkMapFieldLabels[NetworkMapFieldId.TargetNetwork],
              width: 45,
            },
          ]}
          fieldRows={networkMappingFields.map((field, index) => ({
            ...field,
            inputs: [
              <InventorySourceNetworkField
                key={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
                fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
                sourceNetworks={sourceNetworks}
              />,
              <TargetNetworkField
                key={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
                fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
                targetNetworks={targetNetworks}
              />,
            ],
          }))}
          addButton={{
            isDisabled:
              isEmpty(sourceNetworks) ||
              sourceNetworks.length === networkMappingFields.length ||
              sourceNetworksLoading ||
              targetNetworksLoading ||
              isSubmitting ||
              Boolean(loadError),
            label: t('Add mapping'),
            onClick: async () => {
              append(defaultNetworkMapping);
              await trigger(NetworkMapFieldId.NetworkMap);
            },
          }}
          removeButton={{
            isDisabled: () => isSubmitting,
            onClick: (index) => {
              if (networkMappingFields.length > 1) {
                remove(index);
                return;
              }

              setValue(NetworkMapFieldId.NetworkMap, [defaultNetworkMapping]);
            },
          }}
        />
      </ModalForm>
    </FormProvider>
  );
};

export default NetworkMapEdit;
