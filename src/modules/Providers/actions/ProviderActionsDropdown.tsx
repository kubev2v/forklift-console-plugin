import { type FC, type MouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Dropdown,
  Flex,
  FlexItem,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import { ModalHOC } from '../modals/ModalHOC/ModalHOC';
import type { CellProps } from '../views/list/components/CellProps';

import ProviderActionsDropdownItems from './ProviderActionsDropdownItems';

import './ProviderActionsDropdown.style.css';

type ProviderActionsDropdownProps = {
  isKebab?: boolean;
} & CellProps;

/**
 * ProviderActionsKebabDropdown_ is a helper component that displays a kebab dropdown menu.
 * @param {CellProps} props - The properties passed to this component.
 * @param {ProviderWithInventory} props.data - The data to be used in ProviderActionsDropdownItems.
 * @returns {Element} The rendered dropdown menu component.
 */
export const ProviderActionsDropdown: FC<ProviderActionsDropdownProps> = ({ data, isKebab }) => {
  const { t } = useForkliftTranslation();

  // Hook for managing the open/close state of the dropdown
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  // Returning the Dropdown component from PatternFly library
  return (
    <ModalHOC>
      <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
        <FlexItem grow={{ default: 'grow' }} />
        <FlexItem align={{ default: 'alignRight' }}>
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
            <ProviderActionsDropdownItems data={data} />
          </Dropdown>
        </FlexItem>
      </Flex>
    </ModalHOC>
  );
};
