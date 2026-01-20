import { type FC, type MouseEvent, type Ref, useState } from 'react';
import classNames from 'classnames';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import ProviderActionsDropdownItems from './ProviderActionsDropdownItems';

import './ProviderActionsDropdown.style.scss';

type ProviderActionsDropdownProps = {
  data: ProviderData;
  isKebab?: boolean;
};

/**
 * ProviderActionsKebabDropdown_ is a helper component that displays a kebab dropdown menu.
 * @param {CellProps} props - The properties passed to this component.
 * @param {ProviderWithInventory} props.data - The data to be used in ProviderActionsDropdownItems.
 * @returns {Element} The rendered dropdown menu component.
 */
const ProviderActionsDropdown: FC<ProviderActionsDropdownProps> = ({ data, isKebab }) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      className={classNames({ 'forklift-dropdown': !isKebab })}
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
        width: '200px',
      }}
    >
      <ProviderActionsDropdownItems data={data} />
    </Dropdown>
  );
};

export default ProviderActionsDropdown;
