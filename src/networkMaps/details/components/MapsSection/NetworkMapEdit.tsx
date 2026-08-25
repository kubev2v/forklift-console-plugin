import { FormProvider, useForm } from 'react-hook-form';
import { buildNetworkMappings } from 'src/networkMaps/create/utils/buildNetworkMappings';
import { useSourceNetworks } from 'src/utils/hooks/useNetworks';
import useTargetNetworks from 'src/utils/hooks/useTargetNetworks';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { NetworkMapModel } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ModalVariant } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { useResolvedMapProviders } from '@utils/crds/maps/useResolvedMapProviders';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import NetworkMapEditFieldTable from './components/NetworkMapEditFieldTable';
import { PlanOwnerAlert } from './utils/PlanOwnerAlert';
import type { NetworkEditFormValues, NetworkMapEditProps } from './utils/types';

const NetworkMapEdit: OverlayComponent<NetworkMapEditProps> = ({
  closeOverlay,
  destinationProvider: launchedDestinationProvider,
  initialMappings,
  networkMap,
  sourceProvider: launchedSourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const { destinationProvider, providersLoadError, providersReady, sourceProvider } =
    useResolvedMapProviders(networkMap, launchedSourceProvider, launchedDestinationProvider);

  const methods = useForm<NetworkEditFormValues>({
    defaultValues: {
      networkMap: initialMappings,
    },
    mode: 'onChange',
  });

  const {
    formState: { isDirty, isSubmitting, isValid },
    getFieldState,
    handleSubmit,
  } = methods;

  const { error } = getFieldState(NetworkMapFieldId.NetworkMap);

  const [sourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [targetNetworks, targetNetworksLoading, targetNetworksError] =
    useTargetNetworks(destinationProvider);
  const loadError = providersLoadError ?? sourceNetworksError ?? targetNetworksError;

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
        isDisabled={!isValid || !isDirty || !providersReady || Boolean(providersLoadError)}
        onConfirm={handleSubmit(onSubmit)}
        testId="edit-network-map-modal"
        title={t('Edit network map')}
        variant={ModalVariant.medium}
      >
        <NetworkMapEditFieldTable
          isSubmitting={isSubmitting}
          loadError={loadError}
          providersLoadError={providersLoadError}
          providersReady={providersReady}
          sourceNetworks={sourceNetworks}
          sourceNetworksLoading={sourceNetworksLoading}
          targetNetworks={targetNetworks}
          targetNetworksLoading={targetNetworksLoading}
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
