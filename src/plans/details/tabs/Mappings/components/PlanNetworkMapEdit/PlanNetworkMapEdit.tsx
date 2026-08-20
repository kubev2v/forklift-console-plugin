import { FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, ModalVariant, Stack } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import PlanNetworkMapFieldsTable from './components/PlanNetworkMapFieldsTable';
import type { PlanNetworkEditFormValues, PlanNetworkMapEditProps } from './utils/types';
import { patchNetworkMappingValues } from './utils/utils';

const PlanNetworkMapEdit: OverlayComponent<PlanNetworkMapEditProps> = ({
  closeOverlay,
  initialMappings,
  isLoading,
  loadError,
  networkMap,
  otherSourceNetworks,
  oVirtNicProfiles,
  sourceNetworksLoading,
  sourceProvider,
  targetNetworks,
  usedSourceNetworks,
  vms,
}) => {
  const { t } = useForkliftTranslation();
  const methods = useForm<PlanNetworkEditFormValues>({
    defaultValues: {
      networkMap: initialMappings,
    },
    mode: 'onChange',
  });

  const {
    formState: { isDirty, isValid },
    getFieldState,
    handleSubmit,
  } = methods;

  const { error } = getFieldState(NetworkMapFieldId.NetworkMap);

  const onSubmit = async (formData: PlanNetworkEditFormValues): Promise<void> => {
    if (!isDirty) {
      closeOverlay();
      return;
    }

    await patchNetworkMappingValues(formData, networkMap, sourceProvider);
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
        <Stack hasGutter>
          {error?.root && (
            <Alert isInline title={error.root.message} variant={AlertVariant.danger} />
          )}

          {isEmpty(usedSourceNetworks) &&
            isEmpty(otherSourceNetworks) &&
            !sourceNetworksLoading && (
              <Alert
                isInline
                title={t('No source networks are available for the selected VMs.')}
                variant={AlertVariant.warning}
              />
            )}

          <PlanNetworkMapFieldsTable
            isLoading={isLoading}
            loadError={loadError}
            otherSourceNetworks={otherSourceNetworks}
            oVirtNicProfiles={oVirtNicProfiles}
            targetNetworks={targetNetworks}
            usedSourceNetworks={usedSourceNetworks}
            vms={vms}
          />
        </Stack>
      </ModalForm>
    </FormProvider>
  );
};

export default PlanNetworkMapEdit;
