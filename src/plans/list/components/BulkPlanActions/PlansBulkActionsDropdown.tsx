import { type FC, type MouseEvent, type Ref, useState } from 'react';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { Dropdown, DropdownList, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import BulkArchivePlansDropdownItem from './BulkArchivePlansDropdownItem';
import BulkDeletePlansDropdownItem from './BulkDeletePlansDropdownItem';

type PlansBulkActionsDropdownProps = GlobalActionToolbarProps<V1beta1Plan> & {
  namespace: string;
};

const PlansBulkActionsDropdown: FC<PlansBulkActionsDropdownProps> = ({
  namespace,
  selectedIds,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [plans] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const { canDelete, canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined): void => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      data-testid="plans-bulk-actions-dropdown"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      shouldFocusFirstItemOnOpen={false}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          isExpanded={isOpen}
          onClick={() => {
            setIsOpen((open) => !open);
          }}
          ref={toggleRef}
        >
          {t('Actions')}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <BulkArchivePlansDropdownItem
          canPatch={canPatch}
          plans={plans ?? []}
          selectedIds={selectedIds ?? []}
        />
        <BulkDeletePlansDropdownItem
          canDelete={canDelete}
          plans={plans ?? []}
          selectedIds={selectedIds ?? []}
        />
      </DropdownList>
    </Dropdown>
  );
};

export default PlansBulkActionsDropdown;
