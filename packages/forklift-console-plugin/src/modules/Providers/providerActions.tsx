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

export const useMergedProviderActions = ({ resourceData }: { resourceData: MergedProvider }) => {
  const { t } = useTranslation();
  const launchModal = useModal();
  const plansQuery = usePlansQuery(resourceData.namespace);
  const editingDisabled =
    resourceData.isOwnedByController ||
    hasRunningMigration({
      plans: plansQuery?.data?.items,
      providerMetadata: {
        name: resourceData.name,
        namespace: resourceData.namespace,
      },
    });
  const disabledTooltip = resourceData.isOwnedByController
    ? t('The host provider cannot be edited')
    : t('This provider cannot be edited because it has running migrations');

  const actions = useMemo(
    () =>
      [
        {
          id: 'edit',
          cta: () => launchModal(withQueryClient(EditModal), { resourceData }),
          label: t('Edit Provider'),
          disabled: editingDisabled,
          disabledTooltip: editingDisabled ? disabledTooltip : '',
        },
        {
          id: 'delete',
          cta: () => launchModal(withQueryClient(DeleteModal), { resourceData }),
          label: t('Delete Provider'),
          disabled: editingDisabled,
          disabledTooltip: editingDisabled ? disabledTooltip : '',
        },
        resourceData.type === 'openshift' && {
          id: 'selectNetwork',
          cta: () => launchModal(withQueryClient(SelectNetworkForOpenshift), { resourceData }),
          label: t('Select migration network'),
        },
      ].filter(Boolean),
    [t, editingDisabled, disabledTooltip, resourceData],
  );

  return [actions, true, undefined];
};

const EditModal = ({
  resourceData: resourceData,
  closeModal,
}: {
  closeModal: () => void;
  resourceData: MergedProvider;
}) => {
  return (
    <AddEditProviderModal
      onClose={closeModal}
      providerBeingEdited={resourceData.object}
      namespace={resourceData.namespace}
    />
  );
};
EditModal.displayName = 'EditModal';

const SelectNetworkForOpenshift = ({
  resourceData,
  closeModal,
}: {
  closeModal: () => void;
  resourceData: MergedProvider;
}) => {
  const { t } = useTranslation();
  const migrationNetworkMutation = useOCPMigrationNetworkMutation(
    resourceData.namespace,
    closeModal,
  );
  const inventory = toIOpenShiftProvider(resourceData, resourceData.object);
  return (
    <SelectOpenShiftNetworkModal
      targetProvider={inventory}
      targetNamespace={null}
      initialSelectedNetwork={resourceData.defaultTransferNetwork}
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
  resourceData,
  closeModal,
}: {
  closeModal: () => void;
  resourceData: MergedProvider;
}) => {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(true);

  const toggleDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
    closeModal();
  }, [closeModal, isDeleteModalOpen, setIsDeleteModalOpen]);

  const deleteProviderMutation = useDeleteProviderMutation(
    resourceData.namespace,
    resourceData.type as ProviderType,
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
      mutateFn={() => deleteProviderMutation.mutate(resourceData.object)}
      mutateResult={deleteProviderMutation}
      title={t('Delete Provider?')}
      body={
        isTarget(resourceData.type as ProviderType)
          ? t('{{type}} provider {{name}} will no longer be selectable as a migration target.', {
              type: resourceData.type,
              name: resourceData.name,
            })
          : t('{{type}} provider {{name}} will no longer be selectable as a migration source.', {
              type: resourceData.type,
              name: resourceData.name,
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
