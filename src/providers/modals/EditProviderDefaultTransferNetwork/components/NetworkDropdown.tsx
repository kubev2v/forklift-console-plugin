import { type FC, type MouseEvent, type Ref, useMemo, useState } from 'react';
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
import { isEmpty } from '@utils/helpers';

import { getNetworkName } from '../utils/getNetworkName';

type NetworkDropdownProps = {
  provider: V1beta1Provider;
  value: string;
  onChange: (value: string) => void;
};

const NetworkDropdown: FC<NetworkDropdownProps> = ({ onChange, provider, value }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = (): void => {
    setIsOpen((isDropdownOpen) => !isDropdownOpen);
  };

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined): void => {
    setIsOpen(false);
  };

  const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  const name = getNetworkName(value);

  const dropdownItems = useMemo(
    () => [
      <DropdownItem
        value={0}
        key={DEFAULT_NETWORK}
        description={DEFAULT_NETWORK}
        onClick={() => {
          onChange('');
        }}
        isSelected={isEmpty(value)}
      >
        {DEFAULT_NETWORK}
      </DropdownItem>,
      ...(networks ?? []).map((network, index) => (
        <DropdownItem
          value={index}
          key={network.name}
          description={network.namespace}
          onClick={() => {
            onChange(`${network.namespace}/${network.name}`);
          }}
          isSelected={value === `${network.namespace}/${network.name}`}
        >
          {network.name}
        </DropdownItem>
      )),
    ],
    [networks, onChange, value],
  );

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} variant="default">
          {name}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{
        position: 'right',
      }}
      isScrollable
    >
      <DropdownList>{dropdownItems}</DropdownList>
    </Dropdown>
  );
};

export default NetworkDropdown;
