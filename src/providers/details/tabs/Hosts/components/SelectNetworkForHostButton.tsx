import { type FC, useCallback } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { Button, ButtonVariant, ToolbarItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { InventoryHostNetworkTriple } from './utils/types';
import VSphereNetworkModal from './VSphereNetworkModal';

const SelectNetworkForHostButton: FC<{
  selectedIds: string[];
  provider: V1beta1Provider;
  hostsData: InventoryHostNetworkTriple[];
}> = ({ hostsData, provider, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const onClick = useCallback(() => {
    showModal(
      <VSphereNetworkModal provider={provider} data={hostsData} selectedIds={selectedIds} />,
    );
  }, [hostsData, provider, selectedIds, showModal]);

  return (
    <ToolbarItem>
      <Button variant={ButtonVariant.secondary} onClick={onClick} isDisabled={isEmpty(selectedIds)}>
        {t('Select migration network')}
      </Button>
    </ToolbarItem>
  );
};

export default SelectNetworkForHostButton;
