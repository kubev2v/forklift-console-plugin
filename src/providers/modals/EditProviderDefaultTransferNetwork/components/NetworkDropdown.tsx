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
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { getNetworkName } from '../utils/getNetworkName';

type NetworkDropdownProps = {
  onChange: (value: string) => void;
  provider: V1beta1Provider;
  value: string;
};

const NetworkDropdown: FC<NetworkDropdownProps> = ({ onChange, provider, value }) => {
  const { t } = useForkliftTranslation();
  const defaultNetworkLabel = t('Default network');
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
        description={defaultNetworkLabel}
        isSelected={isEmpty(value)}
        key="default-network"
        onClick={() => {
          onChange('');
        }}
        value={0}
      >
        {defaultNetworkLabel}
      </DropdownItem>,
      ...(networks ?? []).map((network, index) => (
        <DropdownItem
          description={network.namespace}
          isSelected={value === `${network.namespace}/${network.name}`}
          key={network.name}
          onClick={() => {
            onChange(`${network.namespace}/${network.name}`);
          }}
          value={index}
        >
          {network.name}
        </DropdownItem>
      )),
    ],
    [defaultNetworkLabel, networks, onChange, value],
  );

  return (
    <Dropdown
      isOpen={isOpen}
      isScrollable
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      popperProps={{
        position: 'right',
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle isExpanded={isOpen} onClick={onToggleClick} ref={toggleRef} variant="default">
          {name}
        </MenuToggle>
      )}
    >
      <DropdownList>{dropdownItems}</DropdownList>
    </Dropdown>
  );
};

export default NetworkDropdown;
