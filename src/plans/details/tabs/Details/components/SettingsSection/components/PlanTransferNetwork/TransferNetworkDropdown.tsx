import { type FC, type Ref, useMemo, useState } from 'react';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';

import type {
  OpenShiftNetworkAttachmentDefinition,
  V1beta1PlanSpecTransferNetwork,
  V1beta1Provider,
} from '@forklift-ui/types';
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
  onChange: (val: V1beta1PlanSpecTransferNetwork | null) => void;
  provider: V1beta1Provider;
  value: V1beta1PlanSpecTransferNetwork | null;
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
      description={t("Use the provider's default transfer network")}
      key="default"
      onClick={() => {
        onChange(null);
      }}
    >
      {PROVIDER_DEFAULTS}
    </DropdownItem>,
    ...transferNetworks.map((network) => (
      <DropdownItem
        description={network.namespace}
        key={`${network.namespace}/${network.name}`}
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
      isScrollable
      onOpenChange={setIsOpen}
      onSelect={() => {
        setIsOpen(false);
      }}
      popperProps={{ position: 'right' }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          isExpanded={isOpen}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          ref={toggleRef}
          variant="default"
        >
          {getNetworkName(value)}
        </MenuToggle>
      )}
    >
      <DropdownList>{dropdownItems}</DropdownList>
    </Dropdown>
  );
};

export default TransferNetworkDropdown;
