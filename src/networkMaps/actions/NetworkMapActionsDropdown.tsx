import { type FC, type MouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Dropdown,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import type { CellProps } from '../list/components/CellProps';

import { NetworkMapActionsDropdownItems } from './NetworkMapActionsDropdownItems';

import './NetworkMapActionsDropdown.style.css';

type NetworkMapActionsDropdownProps = {
  isKebab?: boolean;
} & CellProps;

const NetworkMapActionsDropdown: FC<NetworkMapActionsDropdownProps> = ({ data, isKebab }) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((value) => !value);
  };

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }} />
      <FlexItem align={{ default: 'alignRight' }}>
        <Dropdown
          className={isKebab ? undefined : 'forklift-dropdown pf-c-menu-toggle'}
          isOpen={isOpen}
          onOpenChange={(value: boolean) => {
            setIsOpen(value);
          }}
          onSelect={onSelect}
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              onClick={onToggleClick}
              isExpanded={isOpen}
              variant={isKebab ? 'plain' : 'default'}
            >
              {isKebab ? <EllipsisVIcon /> : t('Actions')}
            </MenuToggle>
          )}
          shouldFocusToggleOnSelect
          popperProps={{
            position: 'right',
          }}
        >
          <DropdownList>
            <NetworkMapActionsDropdownItems data={data} />
          </DropdownList>
        </Dropdown>
      </FlexItem>
    </Flex>
  );
};

export default NetworkMapActionsDropdown;
