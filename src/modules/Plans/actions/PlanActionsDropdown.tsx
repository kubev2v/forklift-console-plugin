import { type FC, type MouseEvent as RMouseEvent, type Ref, useState } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import type { CellProps } from '../../../views/plans/list/components/RowCells/utils/types';

import PlanActionsDropdownItems from './PlanActionsDropdownItems';

import './PlanActionsDropdown.style.css';

type PlanActionsDropdownProps = {
  isKebab?: boolean;
} & CellProps;

const PlanActionsDropdown: FC<PlanActionsDropdownProps> = ({ isKebab, plan }) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const onSelect = (_event: RMouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  return (
    <ModalHOC>
      <Dropdown
        className={isKebab ? undefined : 'forklift-dropdown'}
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
        <PlanActionsDropdownItems plan={plan} />
      </Dropdown>
    </ModalHOC>
  );
};

export default PlanActionsDropdown;
