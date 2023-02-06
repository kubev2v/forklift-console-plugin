import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'src/utils/i18n';

import { withActionContext } from '@kubev2v/common/components/ActionServiceDropdown';
import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { ConfirmModal } from '@kubev2v/legacy/common/components/ConfirmModal';
import { SelectOpenShiftNetworkModal } from '@kubev2v/legacy/common/components/SelectOpenShiftNetworkModal';
import { ProviderType } from '@kubev2v/legacy/common/constants';
import { AddEditProviderModal } from '@kubev2v/legacy/Providers/components/AddEditProviderModal';
import { hasRunningMigration } from '@kubev2v/legacy/Providers/components/ProvidersTable';
import {
  useDeleteProviderMutation,
  useOCPMigrationNetworkMutation,
  usePlansQuery,
} from '@kubev2v/legacy/queries';
import { IOpenShiftProvider } from '@kubev2v/legacy/queries/types';

import { type MergedProvider } from './data';

export const useMergedProviderActions = ({ entity }: { entity: MergedProvider }) => {
  const { t } = useTranslation();
  const launchModal = useModal();
  const plansQuery = usePlansQuery(entity.namespace);
  const isHostProvider = entity.type === 'openshift' && !entity.url;
  const editingDisabled =
    isHostProvider ||
    hasRunningMigration({
      plans: plansQuery?.data?.items,
      providerMetadata: {
        name: entity.name,
        namespace: entity.namespace,
      },
    });
  const disabledTooltip = isHostProvider
    ? t('The host provider cannot be edited')
    : t('This provider cannot be edited because it has running migrations');

  const actions = useMemo(
    () =>
      [
        {
          id: 'edit',
          cta: () => launchModal(withQueryClient(EditModal), { entity }),
          label: t('Edit Provider'),
          disabled: editingDisabled,
          disabledTooltip: editingDisabled ? disabledTooltip : '',
        },
        {
          id: 'delete',
          cta: () => launchModal(withQueryClient(DeleteModal), { entity }),
          label: t('Delete Provider'),
          disabled: editingDisabled,
          disabledTooltip: editingDisabled ? disabledTooltip : '',
        },
        entity.type === 'openshift' && {
          id: 'selectNetwork',
          cta: () => launchModal(withQueryClient(SelectNetworkForOpenshift), { entity }),
          label: t('Select migration network'),
        },
      ].filter(Boolean),
    [t, editingDisabled, disabledTooltip, entity],
  );

  return [actions, true, undefined];
};

const EditModal = ({ entity, closeModal }: { closeModal: () => void; entity: MergedProvider }) => {
  return (
    <AddEditProviderModal
      onClose={closeModal}
      providerBeingEdited={entity.object}
      namespace={entity.namespace}
    />
  );
};
EditModal.displayName = 'EditModal';

const SelectNetworkForOpenshift = ({
  entity,
  closeModal,
}: {
  closeModal: () => void;
  entity: MergedProvider;
}) => {
  const { t } = useTranslation();
  const migrationNetworkMutation = useOCPMigrationNetworkMutation(entity.namespace, closeModal);
  const inventory = toIOpenShiftProvider(entity, entity.object);
  return (
    <SelectOpenShiftNetworkModal
      targetProvider={inventory}
      targetNamespace={null}
      initialSelectedNetwork={entity.defaultTransferNetwork}
      instructions={t(
        'Select a default migration network for the provider. This network will be used for migrating data to all namespaces to which it is attached.',
      )}
      onClose={() => {
        migrationNetworkMutation.reset();
        closeModal();
      }}
      onSubmit={(network) =>
        migrationNetworkMutation.mutate({
          provider: inventory,
          network,
        })
      }
      mutationResult={migrationNetworkMutation}
    />
  );
};
SelectNetworkForOpenshift.displayName = 'SelectNetworkForOpenshift';

const DeleteModal = ({
  entity,
  closeModal,
}: {
  closeModal: () => void;
  entity: MergedProvider;
}) => {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(true);

  const toggleDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
    closeModal();
  }, [closeModal, isDeleteModalOpen, setIsDeleteModalOpen]);

  const deleteProviderMutation = useDeleteProviderMutation(
    entity.namespace,
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
      toggleOpen={toggleDeleteModal}
      mutateFn={() => deleteProviderMutation.mutate(entity.object)}
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
DeleteModal.displayName = 'DeleteModal';

export const ProviderActions = withActionContext<MergedProvider>(
  'kebab',
  'forklift-merged-provider',
);
ProviderActions.displayName = 'ProviderActions';

const toIOpenShiftProvider = (
  { name, namespace, networkCount, selfLink, type, uid, vmCount },
  object,
): IOpenShiftProvider => ({
  object,
  name,
  namespace,
  networkCount,
  selfLink,
  type,
  uid,
  vmCount,
});
