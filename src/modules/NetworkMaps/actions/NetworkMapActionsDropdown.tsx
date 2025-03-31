import React, { type FC, type Ref, useState } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
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

import type { CellProps } from '../views/list/components';

import { NetworkMapActionsDropdownItems } from './NetworkMapActionsDropdownItems';

import './NetworkMapActionsDropdown.style.css';

const NetworkMapActionsKebabDropdown_: FC<NetworkMapActionsDropdownProps> = ({ data, isKebab }) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const onSelect = (_event: React.MouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  // Returning the Dropdown component from PatternFly library
  return (
    <Dropdown
      className={isKebab ? undefined : 'forklift-dropdown pf-c-menu-toggle'}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => {
        setIsOpen(isOpen);
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
      <DropdownList>{NetworkMapActionsDropdownItems({ data })}</DropdownList>
    </Dropdown>
  );
};

export const NetworkMapActionsDropdown: FC<NetworkMapActionsDropdownProps> = (props) => (
  <ModalHOC>
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }} />
      <FlexItem align={{ default: 'alignRight' }}>
        <NetworkMapActionsKebabDropdown_ {...props} />
      </FlexItem>
    </Flex>
  </ModalHOC>
);

export type NetworkMapActionsDropdownProps = {
  isKebab?: boolean;
} & CellProps;
