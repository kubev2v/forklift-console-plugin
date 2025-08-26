import { type FC, type Ref, useState } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';

import type { OpenShiftNetworkAttachmentDefinition, V1beta1Provider } from '@kubev2v/types';
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
  value: string | number;
  onChange: (arg0: string) => void;
  provider: V1beta1Provider;
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
      value={0}
      key={DEFAULT_NETWORK}
      description={DEFAULT_NETWORK}
      onClick={() => {
        onChange('');
      }}
    >
      {DEFAULT_NETWORK}
    </DropdownItem>,
    ...(networks ?? []).map((network) => (
      <DropdownItem
        value={1}
        key={network.name}
        description={network.namespace}
        onClick={() => {
          onChange(`${network.namespace}/${network.name}`);
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
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} variant={'default'}>
          {currentSelectedName}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{
        position: 'right',
      }}
      isScrollable={true}
    >
      <DropdownList>{dropdownItems}</DropdownList>
    </Dropdown>
  );
};

export default ProviderDefaultTransferNetworkDropdown;
