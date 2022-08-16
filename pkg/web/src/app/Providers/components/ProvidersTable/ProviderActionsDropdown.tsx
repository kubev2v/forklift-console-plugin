import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { useDeleteProviderMutation } from '@app/queries';
import { ICorrelatedProvider, InventoryProvider } from '@app/queries/types';
import { PATH_PREFIX, ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { ConfirmModal } from '@app/common/components/ConfirmModal';
import { EditProviderContext } from '@app/Providers/ProvidersPage';
import { ConditionalTooltip } from '@app/common/components/ConditionalTooltip';
import { hasCondition } from '@app/common/helpers';
import { isSameResource } from '@app/queries/helpers';
import { useHistory } from 'react-router-dom';
import { useClusterProvidersQuery } from '@app/queries';

interface IProviderActionsDropdownProps {
  provider: ICorrelatedProvider<InventoryProvider>;
  providerType: ProviderType;
}

export const ProviderActionsDropdown: React.FunctionComponent<IProviderActionsDropdownProps> = ({
  provider,
  providerType,
}: IProviderActionsDropdownProps) => {
  const history = useHistory();
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const { openEditProviderModal, plans } = React.useContext(EditProviderContext);
  const clusterProvidersQuery = useClusterProvidersQuery();
  const clusterProviders = clusterProvidersQuery.data?.items || [];

  const deleteProviderMutation = useDeleteProviderMutation(providerType, () => {
    toggleDeleteModal();
    const numProviders = clusterProviders.filter(
      (clusterProvider) => clusterProvider.spec.type === providerType
    ).length;
    if (numProviders === 1) {
      history.replace(`${PATH_PREFIX}/providers`);
    }
  });

  const hasRunningMigration = !!plans
    .filter((plan) => hasCondition(plan.status?.conditions || [], 'Executing'))
    .find((runningPlan) => {
      const { source, destination } = runningPlan.spec.provider;
      return (
        isSameResource(provider.metadata, source) || isSameResource(provider.metadata, destination)
      );
    });
  const isEditDeleteDisabled = !provider.spec.url || hasRunningMigration;

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
            content={
              !provider.spec.url
                ? 'The host provider cannot be edited'
                : hasRunningMigration
                ? 'This provider cannot be edited because it has running migrations'
                : ''
            }
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
            content={
              !provider.spec.url
                ? 'The host provider cannot be removed'
                : hasRunningMigration
                ? 'This provider cannot be removed because it has running migrations'
                : ''
            }
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
