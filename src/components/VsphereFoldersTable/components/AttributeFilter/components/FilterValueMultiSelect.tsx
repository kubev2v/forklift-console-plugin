import { type Ref, useEffect, useMemo, useState } from 'react';

import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CheckboxAttr } from '../utils/types';

type FilterValueMultiSelectProps<T> = {
  attribute: CheckboxAttr<T>;
  selected: Set<string>;
  onToggle: (optId: string) => void;
  /** When this key changes (e.g., active attribute id), the dropdown closes */
  closeKey?: string;
  width?: number;
};

const FilterValueMultiSelect = <T,>({
  attribute,
  closeKey,
  onToggle,
  selected,
  width = 220,
}: FilterValueMultiSelectProps<T>) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setOpen] = useState(false);

  // Close when switching active attribute (preserves your old behavior)
  useEffect(() => {
    setOpen(false);
  }, [closeKey]);

  const selectedValues = useMemo(() => Array.from(selected ?? new Set<string>()), [selected]);

  return (
    <PfSelect
      role="menu"
      id={`filter-checks-${attribute.id}`}
      isOpen={isOpen}
      selected={selectedValues}
      onSelect={(_e, value) => {
        onToggle(String(value));
      }}
      onOpenChange={(open) => {
        setOpen(open);
      }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => {
            setOpen((open) => !open);
          }}
          isExpanded={isOpen}
          style={{ width }}
        >
          {t('Filter by {{activeFilterLabel}}', {
            activeFilterLabel: attribute.label.toLocaleLowerCase(),
          })}
          {selected.size ? <Badge isRead>{selected.size}</Badge> : null}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      isScrollable
    >
      <SelectList isAriaMultiselectable>
        {attribute.options.map((option) => (
          <SelectOption
            key={option.id}
            value={option.id}
            hasCheckbox
            isSelected={selected.has(option.id)}
          >
            <Split>
              {option.icon ? <SplitItem className="pf-v5-u-mr-sm">{option.icon}</SplitItem> : null}
              <SplitItem>{option.label ?? option.id}</SplitItem>
            </Split>
          </SelectOption>
        ))}
      </SelectList>
    </PfSelect>
  );
};

export default FilterValueMultiSelect;
