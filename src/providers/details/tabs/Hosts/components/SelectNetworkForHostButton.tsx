import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { Button, ToolbarItem } from '@patternfly/react-core';

import type { InventoryHostNetworkTriple } from './utils/types';
import VSphereNetworkModal from './VSphereNetworkModal';

const SelectNetworkForHostButton: FC<{
  selectedIds: string[];
  provider: V1beta1Provider;
  hostsData: InventoryHostNetworkTriple[];
}> = ({ hostsData, provider, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const onClick = () => {
    showModal(
      <VSphereNetworkModal provider={provider} data={hostsData} selectedIds={selectedIds} />,
    );
  };

  return (
    <ToolbarItem>
      <Button variant="secondary" onClick={onClick} isDisabled={!selectedIds?.length}>
        {t('Select migration network')}
      </Button>
    </ToolbarItem>
  );
};

export default SelectNetworkForHostButton;
