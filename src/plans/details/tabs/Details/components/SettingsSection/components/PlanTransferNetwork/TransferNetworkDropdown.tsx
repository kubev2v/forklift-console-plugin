import { type FC, type Ref, useMemo, useState } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1PlanSpecTransferNetwork,
  V1beta1Provider,
} from '@kubev2v/types';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { PROVIDER_DEFAULTS } from './utils/constants';
import { getNetworkName } from './utils/utils';

type TransferNetworkDropdownProps = {
  provider: V1beta1Provider;
  value: V1beta1PlanSpecTransferNetwork | null;
  onChange: (val: V1beta1PlanSpecTransferNetwork | null) => void;
};

const TransferNetworkDropdown: FC<TransferNetworkDropdownProps> = ({
  onChange,
  provider,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  const transferNetworks: V1beta1PlanSpecTransferNetwork[] = useMemo(
    () =>
      (networks ?? []).map((network) => ({
        apiVersion: network.object.apiVersion,
        kind: network.object.kind,
        name: network.name,
        namespace: network.namespace,
        uid: network.uid,
      })),
    [networks],
  );

  const dropdownItems = [
    <DropdownItem
      key="default"
      description={t("Use the provider's default transfer network")}
      onClick={() => {
        onChange(null);
      }}
    >
      {PROVIDER_DEFAULTS}
    </DropdownItem>,
    ...transferNetworks.map((network) => (
      <DropdownItem
        key={`${network.namespace}/${network.name}`}
        description={network.namespace}
        onClick={() => {
          onChange(network);
        }}
      >
        {network.name}
      </DropdownItem>
    )),
  ];

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={() => {
        setIsOpen(false);
      }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          isExpanded={isOpen}
          variant="default"
        >
          {getNetworkName(value)}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{ position: 'right' }}
      isScrollable
    >
      <DropdownList>{dropdownItems}</DropdownList>
    </Dropdown>
  );
};

export default TransferNetworkDropdown;
