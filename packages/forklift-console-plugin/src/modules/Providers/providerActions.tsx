import React, { useCallback, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from 'src/utils/i18n';

import { withActionServiceContext } from '@kubev2v/common/components/ActionServiceDropdown';
import { withQueryClient } from '@kubev2v/common/components/QueryClientHoc';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { ConfirmModal } from '@kubev2v/legacy/common/components/ConfirmModal';
import { ProviderType } from '@kubev2v/legacy/common/constants';
import { AddEditProviderModal } from '@kubev2v/legacy/Providers/components/AddEditProviderModal';
import { hasRunningMigration } from '@kubev2v/legacy/Providers/components/ProvidersTable';
import { useDeleteProviderMutation, usePlansQuery } from '@kubev2v/legacy/queries';
import { IProviderObject } from '@kubev2v/legacy/queries/types';

import { type MergedProvider, isManaged } from './data';

export const useMergedProviderActions = ({ resourceData }: { resourceData: MergedProvider }) => {
  const { t } = useTranslation();
  const launchModal = useModal();
  const plansQuery = usePlansQuery(resourceData.metadata.namespace);
  const managed = isManaged(resourceData);

  const editingDisabled =
    managed ||
    hasRunningMigration({
      plans: plansQuery?.data?.items,
      providerMetadata: {
        name: resourceData.metadata.name,
        namespace: resourceData.metadata.namespace,
      },
    });
  const editDisabledTooltip = managed
    ? t('Managed provider cannot be edited')
    : t('This provider cannot be edited because it has running migrations');
  const deleteDisabledTooltip = managed
    ? t('Managed provider cannot be deleted')
    : t('This provider cannot be deleted because it has running migrations');

  const actions = useMemo(
    () => [
      {
        id: 'edit',
        cta: () => launchModal(withQueryClient(EditModal), { resourceData }),
        label: t('Edit Provider'),
        disabled: editingDisabled,
        disabledTooltip: editingDisabled ? editDisabledTooltip : '',
      },
      {
        id: 'delete',
        cta: () => launchModal(withQueryClient(DeleteModal), { resourceData }),
        label: t('Delete Provider'),
        disabled: editingDisabled,
        disabledTooltip: editingDisabled ? deleteDisabledTooltip : '',
      },
    ],
    [t, editingDisabled, resourceData],
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
      providerBeingEdited={resourceData as unknown as IProviderObject}
      namespace={resourceData.metadata.namespace}
    />
  );
};
EditModal.displayName = 'EditModal';

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
    resourceData.metadata.namespace,
    resourceData.spec.type as ProviderType,
    toggleDeleteModal,
  );
  const isTarget = (type: ProviderType) => type === 'openshift';

  const BodySource = (
    <Trans t={t} ns="plugin__forklift-console-plugin">
      {resourceData.spec.type} provider <strong>{resourceData?.metadata?.name}</strong> will no
      longer be selectable as a migration source.
    </Trans>
  );

  const BodyTarget = (
    <Trans t={t} ns="plugin__forklift-console-plugin">
      {resourceData.spec.type} provider <strong>{resourceData?.metadata?.name}</strong> will no
      longer be selectable as a migration target.
    </Trans>
  );

  return (
    <ConfirmModal
      titleIconVariant="warning"
      confirmButtonVariant="danger"
      position="top"
      isOpen={true}
      toggleOpen={toggleDeleteModal}
      mutateFn={() => deleteProviderMutation.mutate(resourceData as unknown as IProviderObject)}
      mutateResult={deleteProviderMutation}
      title={t('Delete Provider?')}
      body={isTarget(resourceData.spec.type as ProviderType) ? BodyTarget : BodySource}
      confirmButtonText={t('Delete')}
      errorText={t('Cannot remove provider')}
      cancelButtonText={t('Cancel')}
    />
  );
};
DeleteModal.displayName = 'DeleteModal';

/**
 * Use the `console.action/provider` extension named `forklift-merged-provider` to render
 * a set of actions in a kebab menu.
 */
export const ProviderActions = withActionServiceContext<MergedProvider>({
  contextId: 'forklift-merged-provider',
  variant: 'kebab',
});
ProviderActions.displayName = 'ProviderActions';
