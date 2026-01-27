import { type FC, useCallback } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, ToolbarItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { InventoryHostNetworkTriple } from './utils/types';
import VSphereNetworkModal, { type VSphereNetworkModalProps } from './VSphereNetworkModal';

const SelectNetworkForHostButton: FC<{
  selectedIds: string[];
  provider: V1beta1Provider;
  hostsData: InventoryHostNetworkTriple[];
}> = ({ hostsData, provider, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const onClick = useCallback(() => {
    launcher<VSphereNetworkModalProps>(VSphereNetworkModal, {
      data: hostsData,
      provider,
      selectedIds,
    });
  }, [hostsData, provider, selectedIds, launcher]);

  return (
    <ToolbarItem>
      <Button variant={ButtonVariant.secondary} onClick={onClick} isDisabled={isEmpty(selectedIds)}>
        {t('Select migration network')}
      </Button>
    </ToolbarItem>
  );
};

export default SelectNetworkForHostButton;
