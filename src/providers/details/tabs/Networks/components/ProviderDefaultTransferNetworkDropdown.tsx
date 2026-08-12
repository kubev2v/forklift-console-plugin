import { type FC, type Ref, useState } from 'react';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';

import type { OpenShiftNetworkAttachmentDefinition, V1beta1Provider } from '@forklift-ui/types';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { DEFAULT_NETWORK } from '@utils/constants';

import { getNetworkName } from './utils/getNetworkName';

type ProviderDefaultTransferNetworkDropdownProps = {
  onChange: (arg0: string) => void;
  provider: V1beta1Provider;
  value: string | number;
};

const ProviderDefaultTransferNetworkDropdown: FC<ProviderDefaultTransferNetworkDropdownProps> = ({
  onChange,
  provider,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };
  const onSelect = () => {
    setIsOpen(false);
  };

  const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  const currentSelectedName = getNetworkName(value);

  const dropdownItems = [
    <DropdownItem
      description={DEFAULT_NETWORK}
      key={DEFAULT_NETWORK}
      onClick={() => {
        onChange('');
      }}
      value={0}
    >
      {DEFAULT_NETWORK}
    </DropdownItem>,
    ...(networks ?? []).map((network) => (
      <DropdownItem
        description={network.namespace}
        key={network.name}
        onClick={() => {
          onChange(`${network.namespace}/${network.name}`);
        }}
        value={1}
      >
        {network.name}
      </DropdownItem>
    )),
  ];

  return (
    <Dropdown
      isOpen={isOpen}
      isScrollable={true}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      popperProps={{
        position: 'right',
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle isExpanded={isOpen} onClick={onToggleClick} ref={toggleRef} variant={'default'}>
          {currentSelectedName}
        </MenuToggle>
      )}
    >
      <DropdownList>{dropdownItems}</DropdownList>
    </Dropdown>
  );
};

export default ProviderDefaultTransferNetworkDropdown;
