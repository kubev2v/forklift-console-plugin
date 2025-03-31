import React, { type Ref } from 'react';
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

import { ModalHOC } from '../modals';
import type { CellProps } from '../views';

import { ProviderActionsDropdownItems } from './ProviderActionsDropdownItems';

import './ProviderActionsDropdown.style.css';

/**
 * ProviderActionsKebabDropdown_ is a helper component that displays a kebab dropdown menu.
 * @param {CellProps} props - The properties passed to this component.
 * @param {ProviderWithInventory} props.data - The data to be used in ProviderActionsDropdownItems.
 * @returns {React.Element} The rendered dropdown menu component.
 */
const ProviderActionsKebabDropdown_: React.FC<ProviderActionsDropdownProps> = ({
  data,
  isKebab,
}) => {
  const { t } = useForkliftTranslation();

  // Hook for managing the open/close state of the dropdown
  const [isOpen, setIsOpen] = React.useState(false);

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
      onOpenChange={setIsOpen}
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
      <DropdownList>{ProviderActionsDropdownItems({ data })}</DropdownList>
    </Dropdown>
  );
};

/**
 * ProviderActionsDropdown is a component that provides a context for the dropdown menu.
 * It uses a ModalProvider to manage modals that may be used in the dropdown menu.
 * @param {CellProps} props - The properties passed to this component.
 * @returns {React.Element} The rendered component with a ModalProvider context.
 */
export const ProviderActionsDropdown: React.FC<ProviderActionsDropdownProps> = (props) => (
  <ModalHOC>
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }} />
      <FlexItem align={{ default: 'alignRight' }}>
        <ProviderActionsKebabDropdown_ {...props} />
      </FlexItem>
    </Flex>
  </ModalHOC>
);

export type ProviderActionsDropdownProps = {
  isKebab?: boolean;
} & CellProps;
