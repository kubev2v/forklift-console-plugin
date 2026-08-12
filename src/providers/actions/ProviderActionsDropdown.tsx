import { type FC, type MouseEvent, type Ref, useState } from 'react';
import classNames from 'classnames';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import type { ProviderData } from '@utils/providers/types';

import ProviderActionsDropdownItems from './ProviderActionsDropdownItems';

import './ProviderActionsDropdown.style.scss';

type ProviderActionsDropdownProps = {
  data: ProviderData;
  isDetailsPage?: boolean;
};

const ProviderActionsDropdown: FC<ProviderActionsDropdownProps> = ({ data, isDetailsPage }) => {
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
      className={classNames({ 'forklift-dropdown': isDetailsPage })}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      popperProps={{
        position: 'right',
        width: '200px',
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          isExpanded={isOpen}
          onClick={onToggleClick}
          ref={toggleRef}
          variant={isDetailsPage ? 'default' : 'plain'}
        >
          {isDetailsPage ? t('Actions') : <EllipsisVIcon />}
        </MenuToggle>
      )}
    >
      <ProviderActionsDropdownItems data={data} isDetailsPage={isDetailsPage} />
    </Dropdown>
  );
};

export default ProviderActionsDropdown;
