import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { Button, ToolbarItem } from '@patternfly/react-core';

import { VSphereNetworkModal } from '../modals/VSphereNetworkModal';
import type { InventoryHostPair } from '../utils/helpers/matchHostsToInventory';

/**
 * `SelectNetworkButton` is a functional component that renders a button for selecting a migration network.
 * When clicked, it opens a modal dialog for choosing the network.
 *
 * @component
 * @example
 * // Usage within a parent component
 * <SelectNetworkButton
 *   selectedIds={['host1', 'host2']}
 *   provider={myProvider}
 *   hostsData={myInventoryHostPairs}
 * />
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string[]} props.selectedIds - An array of host IDs that are selected for migration.
 * @param {V1beta1Provider} props.provider - The provider object containing details about the provider.
 * @param {InventoryHostPair[]} props.hostsData - An array of inventory host pairs for displaying in the modal.
 */
export const SelectNetworkButton: FC<{
  selectedIds: string[];
  provider: V1beta1Provider;
  hostsData: InventoryHostPair[];
}> = ({ hostsData, provider, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const onClick = () => {
    showModal(<VSphereNetworkModal provider={provider} data={hostsData} selected={selectedIds} />);
  };

  return (
    <ToolbarItem>
      <Button variant="secondary" onClick={onClick} isDisabled={!selectedIds?.length}>
        {t('Select migration network')}
      </Button>
    </ToolbarItem>
  );
};
