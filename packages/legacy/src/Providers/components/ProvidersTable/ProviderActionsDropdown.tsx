import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { useDeleteProviderMutation, useClusterProvidersQuery } from 'legacy/src/queries';
import { ICorrelatedProvider, InventoryProvider } from 'legacy/src/queries/types';
import { PATH_PREFIX, ProviderType, PROVIDER_TYPE_NAMES } from 'legacy/src/common/constants';
import { ConfirmModal } from 'legacy/src/common/components/ConfirmModal';
import { EditProviderContext } from 'legacy/src/Providers/EditProviderContext';
import { ConditionalTooltip } from 'legacy/src/common/components/ConditionalTooltip';
import { useHistory } from 'react-router-dom';
import { hasRunningMigration } from './helpers';

interface IProviderActionsDropdownProps {
  provider: ICorrelatedProvider<InventoryProvider>;
  providerType: ProviderType;
}

/**
 * @deprecated
 */
export const ProviderActionsDropdown: React.FunctionComponent<IProviderActionsDropdownProps> = ({
  provider,
  providerType,
}: IProviderActionsDropdownProps) => {
  const history = useHistory();
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const { openEditProviderModal, plans } = React.useContext(EditProviderContext);
  const clusterProvidersQuery = useClusterProvidersQuery(provider.metadata.namespace);
  const clusterProviders = clusterProvidersQuery.data?.items || [];

  const deleteProviderMutation = useDeleteProviderMutation(
    provider.metadata.namespace,
    providerType,
    () => {
      toggleDeleteModal();
      const numProviders = clusterProviders.filter(
        (clusterProvider) => clusterProvider.spec.type === providerType
      ).length;
      if (numProviders === 1) {
        history.replace(`${PATH_PREFIX}/providers`);
      }
    }
  );

  const isEditDeleteDisabled =
    !provider.spec.url || hasRunningMigration({ plans, providerMetadata: provider.metadata });

  const disabledEditTooltip = !provider.spec.url
    ? 'The host provider cannot be edited'
    : 'This provider cannot be edited because it has running migrations';
  const disabledDeleteTooltip = !provider.spec.url
    ? 'The host provider cannot be removed'
    : 'This provider cannot be removed because it has running migrations';

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <ConditionalTooltip
            key="edit"
            isTooltipEnabled={isEditDeleteDisabled}
            content={isEditDeleteDisabled ? disabledEditTooltip : ''}
          >
            <DropdownItem
              aria-label="Edit"
              onClick={() => {
                setKebabIsOpen(false);
                openEditProviderModal(provider);
              }}
              isDisabled={isEditDeleteDisabled}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
          <ConditionalTooltip
            key="remove"
            isTooltipEnabled={isEditDeleteDisabled}
            content={isEditDeleteDisabled ? disabledDeleteTooltip : ''}
          >
            <DropdownItem
              aria-label="Remove"
              onClick={() => {
                setKebabIsOpen(false);
                toggleDeleteModal();
              }}
              isDisabled={deleteProviderMutation.isLoading || isEditDeleteDisabled}
            >
              Remove
            </DropdownItem>
          </ConditionalTooltip>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        mutateFn={() => deleteProviderMutation.mutate(provider)}
        mutateResult={deleteProviderMutation}
        title="Permanently remove provider?"
        body={`${PROVIDER_TYPE_NAMES[providerType]} provider "${provider.metadata.name}" will no longer be selectable as a migration target.`}
        confirmButtonText="Remove"
        errorText="Cannot remove provider"
      />
    </>
  );
};
