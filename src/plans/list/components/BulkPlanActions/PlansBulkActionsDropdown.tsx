import { type FC, type MouseEvent, type Ref, useContext, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';
import {
  Dropdown,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';

import BulkArchivePlansDropdownItem from './BulkArchivePlansDropdownItem';
import BulkDeletePlansDropdownItem from './BulkDeletePlansDropdownItem';
import { PlansBulkActionsContext } from './PlansBulkActionsContext';

const PlansBulkActionsDropdown: FC<GlobalActionToolbarProps<V1beta1Plan>> = ({ selectedIds }) => {
  const { t } = useForkliftTranslation();
  const { canDelete, canPatch, onComplete, plans } = useContext(PlansBulkActionsContext);
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      data-testid="plans-bulk-actions-dropdown"
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => {
            setIsOpen((open) => !open);
          }}
          isExpanded={isOpen}
        >
          {t('Actions')}
        </MenuToggle>
      )}
      shouldFocusFirstItemOnOpen={false}
    >
      <DropdownList>
        <BulkArchivePlansDropdownItem
          plans={plans}
          selectedIds={selectedIds ?? []}
          canPatch={canPatch}
          onComplete={onComplete}
        />
        <BulkDeletePlansDropdownItem
          plans={plans}
          selectedIds={selectedIds ?? []}
          canDelete={canDelete}
          onComplete={onComplete}
        />
      </DropdownList>
    </Dropdown>
  );
};

export default PlansBulkActionsDropdown;
