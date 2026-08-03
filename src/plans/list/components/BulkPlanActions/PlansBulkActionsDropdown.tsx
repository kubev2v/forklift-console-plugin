import { type FC, type MouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';
import { Dropdown, DropdownList, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';

import BulkArchivePlansDropdownItem from './BulkArchivePlansDropdownItem';
import BulkDeletePlansDropdownItem from './BulkDeletePlansDropdownItem';

type PlansBulkActionsDropdownProps = GlobalActionToolbarProps<V1beta1Plan> & {
  plans: V1beta1Plan[];
  canPatch: boolean;
  canDelete: boolean;
  onComplete?: () => void;
};

const PlansBulkActionsDropdown: FC<PlansBulkActionsDropdownProps> = ({
  canDelete,
  canPatch,
  onComplete,
  plans,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
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
