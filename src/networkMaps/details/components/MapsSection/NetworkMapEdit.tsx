import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import InventorySourceNetworkField from 'src/networkMaps/create/fields/InventorySourceNetworkField';
import { validateNetworkMaps } from 'src/networkMaps/create/fields/utils';
import { buildNetworkMappings } from 'src/networkMaps/create/utils/buildNetworkMappings';
import { defaultNetworkMapping, networkMapFieldLabels } from 'src/networkMaps/utils/constants';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import { useSourceNetworks } from 'src/utils/hooks/useNetworks';
import useTargetNetworks from 'src/utils/hooks/useTargetNetworks';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import { FormErrorHelperText } from '@components/FormErrorHelperText';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { NetworkMapModel } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ModalVariant } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { defaultNetMapping } from '@utils/mappings/networkMap';

import { PlanOwnerAlert } from './utils/PlanOwnerAlert';
import type { NetworkEditFormValues, NetworkMapEditProps } from './utils/types';

const NetworkMapEdit: OverlayComponent<NetworkMapEditProps> = ({
  closeOverlay,
  destinationProvider,
  initialMappings,
  networkMap,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const methods = useForm<NetworkEditFormValues>({
    defaultValues: {
      networkMap: initialMappings,
    },
    mode: 'onChange',
  });

  const {
    control,
    formState: { isDirty, isSubmitting, isValid },
    getFieldState,
    handleSubmit,
    setValue,
  } = methods;

  const { error } = getFieldState(NetworkMapFieldId.NetworkMap);

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
  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useTargetNetworks(destinationProvider);
  const loadError = sourceNetworksError ?? targetNetworksError;

  const onSubmit = async (formData: NetworkEditFormValues): Promise<void> => {
    if (!isDirty) {
      closeOverlay();
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
        closeOverlay={closeOverlay}
        isDisabled={!isValid || !isDirty}
        onConfirm={handleSubmit(onSubmit)}
        testId="edit-network-map-modal"
        title={t('Edit network map')}
        variant={ModalVariant.medium}
      >
        <FieldBuilderTable
          addButton={{
            isDisabled:
              isEmpty(sourceNetworks) ||
              sourceNetworksLoading ||
              targetNetworksLoading ||
              isSubmitting ||
              Boolean(loadError),
            label: t('Add mapping'),
            onClick: () => {
              append({
                [NetworkMapFieldId.SourceNetwork]:
                  defaultNetMapping[NetworkMapFieldId.SourceNetwork],
                [NetworkMapFieldId.TargetNetwork]:
                  defaultNetMapping[NetworkMapFieldId.TargetNetwork],
              });
            },
          }}
          fieldRows={networkMappingFields.map((field, index) => ({
            ...field,
            inputs: [
              <InventorySourceNetworkField
                fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
                key={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
                sourceNetworks={sourceNetworks}
              />,
              <TargetNetworkField
                emptyStateMessage={t('Select a target provider to list available target networks')}
                fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
                isDisabled={isSubmitting}
                key={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
                showIgnoreNetworkOption
                targetNetworks={targetNetworks}
              />,
            ],
          }))}
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
        <PlanOwnerAlert networkMap={networkMap} />
        {error?.root && (
          <div className="pf-v6-u-mt-sm">
            <FormErrorHelperText error={error.root} />
          </div>
        )}
      </ModalForm>
    </FormProvider>
  );
};

export default NetworkMapEdit;
