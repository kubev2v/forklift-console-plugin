import React, { useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { withQueryClient } from '@kubev2v/common';
import { ConfirmModal } from '@kubev2v/legacy/common/components/ConfirmModal';
import { AddEditMappingModal } from '@kubev2v/legacy/Mappings/components/AddEditMappingModal';
import { useDeleteMappingMutation } from '@kubev2v/legacy/queries';
import { Mapping, MappingType } from '@kubev2v/legacy/queries/types';
import { NetworkMapModel } from '@kubev2v/types';
import { useAccessReview, useModal } from '@openshift-console/dynamic-plugin-sdk';

import { CommonMapping } from './data';

export function useMappingActions<T extends CommonMapping>({
  resourceData,
  mappingType,
}: {
  resourceData: T;
  mappingType: MappingType;
}) {
  const { t } = useForkliftTranslation();
  const launchModal = useModal();

  const [canDelete] = useAccessReview({
    group: NetworkMapModel.apiGroup,
    resource: NetworkMapModel.plural,
    verb: 'delete',
    name: resourceData.name,
    namespace: resourceData.namespace,
  });

  const [canPatch] = useAccessReview({
    group: NetworkMapModel.apiGroup,
    resource: NetworkMapModel.plural,
    verb: 'patch',
    name: resourceData.name,
    namespace: resourceData.namespace,
  });

  const actions = useMemo(
    () => [
      {
        id: 'edit',
        cta: () =>
          launchModal(withQueryClient(EditMappingModal), {
            mapping: resourceData.object,
            mappingType,
            namespace: resourceData.namespace,
          }),
        label: t('Edit Mapping'),
        disabled: !canPatch || resourceData.managed,
        disabledTooltip: t('Managed mappings can not be edited'),
      },
      {
        id: 'delete',
        cta: () =>
          launchModal(withQueryClient(DeleteMappingModal), {
            mapping: resourceData.object,
            mappingType,
            namespace: resourceData.namespace,
            name: resourceData.name,
          }),
        label: t('Delete Mapping'),
        disabled: !canDelete || resourceData.managed,
        disabledTooltip: t('Managed mappings can not be deleted'),
      },
    ],
    [t, resourceData, canPatch, canDelete],
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
  const { t } = useForkliftTranslation();
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
  const { t } = useForkliftTranslation();
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
