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
  isDetailsPage?: boolean;
} & CellProps;

const NetworkMapActionsDropdown: FC<NetworkMapActionsDropdownProps> = ({ data, isDetailsPage }) => {
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
          className={isDetailsPage ? 'forklift-dropdown pf-c-menu-toggle' : undefined}
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
              variant={isDetailsPage ? 'default' : 'plain'}
            >
              {isDetailsPage ? t('Actions') : <EllipsisVIcon />}
            </MenuToggle>
          )}
          shouldFocusToggleOnSelect
          popperProps={{
            position: 'right',
          }}
        >
          <DropdownList>
            <NetworkMapActionsDropdownItems data={data} isDetailsPage={isDetailsPage} />
          </DropdownList>
        </Dropdown>
      </FlexItem>
    </Flex>
  );
};

export default NetworkMapActionsDropdown;
