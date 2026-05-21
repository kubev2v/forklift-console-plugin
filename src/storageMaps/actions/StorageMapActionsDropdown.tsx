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

import { StorageMapActionsDropdownItems } from './StorageMapActionsDropdownItems';

import './StorageMapActionsDropdown.style.css';

const StorageMapActionsKebabDropdown: FC<StorageMapActionsDropdownProps> = ({
  data,
  isDetailsPage,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((value) => !value);
  };

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      className={isDetailsPage ? 'forklift-dropdown pf-c-menu-toggle' : undefined}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
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
        <StorageMapActionsDropdownItems data={data} isDetailsPage={isDetailsPage} />
      </DropdownList>
    </Dropdown>
  );
};

export const StorageMapActionsDropdown: FC<StorageMapActionsDropdownProps> = (props) => (
  <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
    <FlexItem grow={{ default: 'grow' }} />
    <FlexItem align={{ default: 'alignRight' }}>
      <StorageMapActionsKebabDropdown {...props} />
    </FlexItem>
  </Flex>
);

type StorageMapActionsDropdownProps = {
  isDetailsPage?: boolean;
} & CellProps;
