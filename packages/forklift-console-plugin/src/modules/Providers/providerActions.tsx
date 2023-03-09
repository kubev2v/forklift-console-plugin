import React, { useCallback, useMemo, useState } from 'react';
import jsonpath from 'jsonpath';
import { DEFAULT_TRANSFER_NETWORK_ANNOTATION, IS_MANAGED_JSONPATH } from 'src/utils/constants';
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
import { IOpenShiftProvider, IProviderObject } from '@kubev2v/legacy/queries/types';

import { type MergedProvider } from './data';

export const useMergedProviderActions = ({ entity }: { entity: MergedProvider }) => {
  const { t } = useTranslation();
  const launchModal = useModal();
  const plansQuery = usePlansQuery(entity?.metadata.namespace);
  const isOwned = entity && jsonpath.query(entity, IS_MANAGED_JSONPATH).length > 0;

  const editingDisabled =
    isOwned ||
    hasRunningMigration({
      plans: plansQuery?.data?.items,
      providerMetadata: {
        name: entity?.metadata.name,
        namespace: entity?.metadata.namespace,
      },
    });
  const disabledTooltip = isOwned
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
        entity?.spec.type === 'openshift' && {
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
      providerBeingEdited={entity as unknown as IProviderObject}
      namespace={entity?.metadata.namespace}
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
  const migrationNetworkMutation = useOCPMigrationNetworkMutation(
    entity?.metadata.namespace,
    closeModal,
  );
  const inventory = entity.inventory;
  return (
    <SelectOpenShiftNetworkModal
      targetProvider={inventory as IOpenShiftProvider}
      targetNamespace={null}
      initialSelectedNetwork={entity?.metadata?.annotations?.[DEFAULT_TRANSFER_NETWORK_ANNOTATION]}
      instructions={t(
        'Select a default migration network for the provider. This network will be used for migrating data to all namespaces to which it is attached.',
      )}
      onClose={() => {
        migrationNetworkMutation.reset();
        closeModal();
      }}
      onSubmit={(network) =>
        migrationNetworkMutation.mutate({
          provider: inventory as IOpenShiftProvider,
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
    entity.metadata.namespace,
    entity?.spec.type as ProviderType,
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
      mutateFn={() => deleteProviderMutation.mutate(entity as unknown as IProviderObject)}
      mutateResult={deleteProviderMutation}
      title={t('Delete Provider?')}
      body={
        isTarget(entity?.spec.type as ProviderType)
          ? t('{{type}} provider {{name}} will no longer be selectable as a migration target.', {
              type: entity?.spec.type,
              name: entity?.metadata.name,
            })
          : t('{{type}} provider {{name}} will no longer be selectable as a migration source.', {
              type: entity?.spec.type,
              name: entity?.metadata.name,
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
