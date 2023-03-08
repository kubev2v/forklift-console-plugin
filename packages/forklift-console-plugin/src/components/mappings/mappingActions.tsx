import React, { useMemo } from 'react';
import { ConfirmModal } from 'legacy/src/common/components/ConfirmModal';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { useDeleteMappingMutation } from 'legacy/src/queries';
import { Mapping, MappingType } from 'legacy/src/queries/types';
import { useTranslation } from 'src/utils/i18n';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';

import { CommonMapping } from './data';

export function useMappingActions<T extends CommonMapping>({
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
  const title = mappingType === 'Network' ? t('Edit NetworkMap') : t('Edit StorageMap');
  return (
    <AddEditMappingModal
      title={title}
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
  const msg = {
    title: mappingType === 'Network' ? t('Delete NetworkMap?') : t('Delete StorageMap?'),
    body: t(
      'You will no longer be able to select mapping "{{name}}" when you create a migration plan.',
      { name },
    ),
    errorText:
      mappingType === 'Network'
        ? t('Cannot delete network mapping')
        : t('Cannot delete storage mapping'),
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
