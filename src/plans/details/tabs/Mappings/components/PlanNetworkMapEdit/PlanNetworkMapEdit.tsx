import { FormProvider, useForm } from 'react-hook-form';
import { NetworkMapFieldId } from 'src/networkMaps/utils/types';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, ModalVariant, Stack } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import PlanNetworkMapFieldsTable from './components/PlanNetworkMapFieldsTable';
import type { PlanNetworkEditFormValues, PlanNetworkMapEditProps } from './utils/types';
import { patchNetworkMappingValues } from './utils/utils';

const PlanNetworkMapEdit: ModalComponent<PlanNetworkMapEditProps> = ({
  closeModal,
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

  const onSubmit = async (formData: PlanNetworkEditFormValues) => {
    if (!isDirty) {
      closeModal();
      return;
    }

    await patchNetworkMappingValues(formData, networkMap, sourceProvider);
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit network map')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isValid || !isDirty}
      >
        <Stack hasGutter>
          {error?.root && (
            <Alert variant={AlertVariant.danger} isInline title={error.root.message} />
          )}

          {isEmpty(usedSourceNetworks) && !sourceNetworksLoading && (
            <Alert
              variant={AlertVariant.warning}
              isInline
              title={t('No source networks are available for the selected VMs.')}
              className="pf-v"
            />
          )}

          <PlanNetworkMapFieldsTable
            oVirtNicProfiles={oVirtNicProfiles}
            usedSourceNetworks={usedSourceNetworks}
            otherSourceNetworks={otherSourceNetworks}
            vms={vms}
            isLoading={isLoading}
            loadError={loadError}
            targetNetworks={targetNetworks}
          />
        </Stack>
      </ModalForm>
    </FormProvider>
  );
};

export default PlanNetworkMapEdit;
