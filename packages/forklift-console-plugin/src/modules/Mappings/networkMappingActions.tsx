import React, { useMemo } from 'react';
import { ConfirmModal } from 'legacy/src/common/components/ConfirmModal';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { useDeleteMappingMutation } from 'legacy/src/queries';
import { MappingType } from 'legacy/src/queries/types';
import { useTranslation } from 'src/utils/i18n';

import { withActionContext } from '@kubev2v/common/components/ActionServiceDropdown';
import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';

import { FlatNetworkMapping } from './data';

export const useNetworkMappingActions = ({ entity }: { entity: FlatNetworkMapping }) => {
  const { t } = useTranslation();
  const launchModal = useModal();
  const areProvidersReady = entity.sourceReady && entity.targetReady;
  const areProvidersResolved = entity.sourceResolved && entity.targetResolved;
  const editingDisabled = !areProvidersReady || !areProvidersResolved;

  const disabledTooltip = !areProvidersResolved
    ? t(
        'This mapping cannot be edited because it includes missing source or target resources. Delete and recreate the mapping.',
      )
    : t(
        'This mapping cannot be edited because the inventory data for its associated providers is not ready',
      );

  const actions = useMemo(
    () => [
      {
        id: 'edit',
        cta: () => launchModal(withQueryClient(EditModal), { entity }),
        label: t('Edit Mapping'),
        disabled: editingDisabled,
        disabledTooltip: editingDisabled ? disabledTooltip : '',
      },
      {
        id: 'delete',
        cta: () => launchModal(withQueryClient(DeleteModal), { entity }),
        label: t('Delete Mapping'),
      },
    ],
    [t, editingDisabled, disabledTooltip, entity],
  );

  return [actions, true, undefined];
};

const EditModal = ({
  entity,
  closeModal,
}: {
  closeModal: () => void;
  entity: FlatNetworkMapping;
}) => {
  const { t } = useTranslation();
  return (
    <AddEditMappingModal
      title={t('Edit Mapping')}
      onClose={closeModal}
      mappingType={MappingType.Network}
      mappingBeingEdited={entity.object}
      setActiveMapType={() => undefined}
      namespace={entity.namespace}
    />
  );
};

const DeleteModal = ({
  entity,
  closeModal,
}: {
  closeModal: () => void;
  entity: FlatNetworkMapping;
}) => {
  const { t } = useTranslation();
  const deleteMappingMutation = useDeleteMappingMutation(
    MappingType.Network,
    entity.namespace,
    closeModal,
  );
  return (
    <ConfirmModal
      titleIconVariant="warning"
      confirmButtonVariant="danger"
      position="top"
      isOpen
      toggleOpen={closeModal}
      mutateFn={() => deleteMappingMutation.mutate(entity.object)}
      mutateResult={deleteMappingMutation}
      title={t('Permanently delete network mapping?')}
      body={t(
        'You will no longer be able to select network mapping "{{name}}" when you create a migration plan.',
        { name: entity.name },
      )}
      confirmButtonText={t('Delete')}
      errorText={t('Cannot delete network mapping')}
    />
  );
};

export const NetworkMappingActions = withActionContext<FlatNetworkMapping>(
  'kebab',
  'forklift-flat-network-mapping',
);
NetworkMappingActions.displayName = 'NetworkMappingActions';
