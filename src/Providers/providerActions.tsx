import React, { useMemo, useState } from 'react';
import { createActions } from 'src/extensions/actions';
import withQueryClient from 'src/extensions/QueryClientHoc';
import { useTranslation } from 'src/internal/i18n';

import { ConfirmModal } from '@app/common/components/ConfirmModal';
import { ProviderType } from '@app/common/constants';
import { useDeleteProviderMutation } from '@app/queries';
import {
  ActionServiceProvider,
  K8sResourceCommon,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';

import { MergedProvider, useProvidersWithInventory } from './data';

export const useProviderResourceActions = (resource: K8sResourceCommon) => {
  const [[provider]] = useProvidersWithInventory({
    kind: resource?.kind ?? '',
    namespace: resource?.metadata?.namespace ?? '',
    name: resource?.metadata?.name ?? '',
  });

  return useMergedProviderActions(provider);
};

export const useMergedProviderActions = (entity: MergedProvider) => {
  const { t } = useTranslation();
  const launchModal = useModal();
  const actions = useMemo(
    () => [
      {
        id: 'edit',
        cta: () => console.warn('edit provider!'),
        label: t('Edit Provider'),
      },
      {
        id: 'delete',
        cta: () => launchModal(withQueryClient(DeleteModal), { entity }),
        label: t('Delete Provider'),
      },
      {
        id: 'selectNetwork',
        cta: () => console.warn('select network!'),
        label: t('Select migration network'),
      },
    ],
    [t],
  );

  return [actions, true, undefined];
};

const DeleteModal = ({
  entity,
  closeModal,
}: {
  closeModal: () => void;
  entity: MergedProvider;
}) => {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(true);

  const toggleDeleteModal = () => setIsDeleteModalOpen(!isDeleteModalOpen);
  const deleteProviderMutation = useDeleteProviderMutation(
    entity.type as ProviderType,
    toggleDeleteModal,
  );
  const isTarget = (type: ProviderType) => type !== 'openshift';

  return (
    <ConfirmModal
      titleIconVariant="warning"
      confirmButtonVariant="danger"
      position="top"
      isOpen={true}
      toggleOpen={() => {
        toggleDeleteModal();
        closeModal();
      }}
      mutateFn={() =>
        deleteProviderMutation.mutate({
          metadata: {
            name: entity.name,
            namespace: entity.namespace,
          },
          spec: { type: entity.type as ProviderType },
          kind: '',
          apiVersion: '',
        })
      }
      mutateResult={deleteProviderMutation}
      title={t('Permanently delete provider?')}
      body={
        isTarget(entity.type as ProviderType)
          ? t('{{type}} provider {{name}} will no longer be selectable as a migration target.', {
              type: entity.type,
              name: entity.name,
            })
          : t('{{type}} provider {{name}} will no longer be selectable as a migration source.', {
              type: entity.type,
              name: entity.name,
            })
      }
      confirmButtonText={t('Delete')}
      errorText={t('Cannot remove provider')}
      cancelButtonText={t('Cancel')}
    />
  );
};
export interface ProviderActionsProps {
  entity: MergedProvider;
  variant?: 'kebab' | 'dropdown';
}

export const ProviderActions = ({ entity, variant = 'kebab' }: ProviderActionsProps) => {
  const ActionsComponent = useMemo(() => createActions(variant), [variant]);
  return (
    <ActionServiceProvider context={{ mergedProvider: entity }}>
      {ActionsComponent}
    </ActionServiceProvider>
  );
};
