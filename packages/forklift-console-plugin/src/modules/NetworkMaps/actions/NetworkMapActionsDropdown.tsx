import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Dropdown,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import { CellProps } from '../views/list/components';

import { NetworkMapActionsDropdownItems } from './NetworkMapActionsDropdownItems';

import './NetworkMapActionsDropdown.style.css';

const NetworkMapActionsKebabDropdown_: React.FC<NetworkMapActionsDropdownProps> = ({
  data,
  isKebab,
}) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = React.useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    // eslint-disable-next-line no-console
    console.log('selected', value);
    setIsOpen(false);
  };

  // Returning the Dropdown component from PatternFly library
  return (
    <Dropdown
      className={isKebab ? undefined : 'forklift-dropdown pf-c-menu-toggle'}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      onSelect={onSelect}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
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

export const NetworkMapActionsDropdown: React.FC<NetworkMapActionsDropdownProps> = (props) => (
  <ModalHOC>
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }}></FlexItem>
      <FlexItem align={{ default: 'alignRight' }}>
        <NetworkMapActionsKebabDropdown_ {...props} />
      </FlexItem>
    </Flex>
  </ModalHOC>
);

export interface NetworkMapActionsDropdownProps extends CellProps {
  isKebab?: boolean;
}
