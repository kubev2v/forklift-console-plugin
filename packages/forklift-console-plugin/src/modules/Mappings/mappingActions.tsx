import React, { useMemo } from 'react';
import { ConfirmModal } from 'legacy/src/common/components/ConfirmModal';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { useDeleteMappingMutation } from 'legacy/src/queries';
import { Mapping, MappingType } from 'legacy/src/queries/types';
import { useTranslation } from 'src/utils/i18n';

import { withActionContext } from '@kubev2v/common/components/ActionServiceDropdown';
import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';

import { CommonMapping } from './dataCommon';
import { FlatNetworkMapping } from './dataForNetwork';
import { FlatStorageMapping } from './dataForStorage';

export const useNetworkMappingActions = ({ entity }: { entity: FlatNetworkMapping }) =>
  useMappingActions<FlatNetworkMapping>({ entity, mappingType: MappingType.Network });

export const useStorageMappingActions = ({ entity }: { entity: FlatStorageMapping }) =>
  useMappingActions<FlatStorageMapping>({ entity, mappingType: MappingType.Storage });

function useMappingActions<T extends CommonMapping>({
  entity,
  mappingType,
}: {
  entity: T;
  mappingType: MappingType;
}) {
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
        cta: () =>
          launchModal(withQueryClient(EditMappingModal), {
            mapping: entity.object,
            mappingType,
            namespace: entity.namespace,
          }),
        label: t('Edit Mapping'),
        disabled: editingDisabled,
        disabledTooltip: editingDisabled ? disabledTooltip : '',
      },
      {
        id: 'delete',
        cta: () =>
          launchModal(withQueryClient(DeleteMappingModal), {
            mapping: entity.object,
            mappingType,
            namespace: entity.namespace,
            name: entity.name,
          }),
        label: t('Delete Mapping'),
      },
    ],
    [t, editingDisabled, disabledTooltip, entity],
  );

  return [actions, true, undefined];
}

const EditMappingModal = ({
  mapping,
  closeModal,
  mappingType,
  namespace,
}: {
  closeModal: () => void;
  mapping: Mapping;
  mappingType: MappingType;
  namespace: string;
}) => {
  const { t } = useTranslation();
  return (
    <AddEditMappingModal
      title={t('Edit Mapping')}
      onClose={closeModal}
      mappingType={mappingType}
      mappingBeingEdited={mapping}
      setActiveMapType={() => undefined}
      namespace={namespace}
    />
  );
};
EditMappingModal.displayName = 'EditMappingModal';

const DeleteMappingModal = ({
  mapping,
  closeModal,
  mappingType,
  namespace,
  name,
}: {
  closeModal: () => void;
  mapping: Mapping;
  mappingType: MappingType;
  namespace: string;
  name: string;
}) => {
  const { t } = useTranslation();
  const deleteMappingMutation = useDeleteMappingMutation(mappingType, namespace, closeModal);
  const msg =
    mappingType === MappingType.Network
      ? {
          title: t('Permanently delete network mapping?'),
          body: t(
            'You will no longer be able to select network mapping "{{name}}" when you create a migration plan.',
            { name },
          ),
          errorText: t('Cannot delete network mapping'),
        }
      : {
          title: t('Permanently delete storage mapping?'),
          body: t(
            'You will no longer be able to select storage mapping "{{name}}" when you create a migration plan.',
            { name },
          ),
          errorText: t('Cannot delete storage mapping'),
        };
  return (
    <ConfirmModal
      titleIconVariant="warning"
      confirmButtonVariant="danger"
      position="top"
      isOpen
      toggleOpen={closeModal}
      mutateFn={() => deleteMappingMutation.mutate(mapping)}
      mutateResult={deleteMappingMutation}
      title={msg.title}
      body={msg.body}
      confirmButtonText={t('Delete')}
      errorText={msg.errorText}
    />
  );
};
DeleteMappingModal.displayName = 'DeleteMappingModal';

export const NetworkMappingActions = withActionContext<FlatNetworkMapping>(
  'kebab',
  'forklift-flat-network-mapping',
);
NetworkMappingActions.displayName = 'NetworkMappingActions';

export const StorageMappingActions = withActionContext<FlatStorageMapping>(
  'kebab',
  'forklift-flat-storage-mapping',
);
StorageMappingActions.displayName = 'StorageMappingActions';
