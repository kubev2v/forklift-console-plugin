import { type Ref, useMemo, useState } from 'react';

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
  /** When this key changes (e.g., active attribute id), the dropdown closes */
  closeKey?: string;
  onToggle: (optId: string) => void;
  selected: Set<string>;
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
  const [prevCloseKey, setPrevCloseKey] = useState(closeKey);

  if (closeKey !== prevCloseKey) {
    setPrevCloseKey(closeKey);
    setOpen(false);
  }

  const selectedValues = useMemo(() => Array.from(selected ?? new Set<string>()), [selected]);

  return (
    <PfSelect
      id={`filter-checks-${attribute.id}`}
      isOpen={isOpen}
      isScrollable
      onOpenChange={(open) => {
        setOpen(open);
      }}
      onSelect={(_e, value) => {
        onToggle(String(value));
      }}
      role="menu"
      selected={selectedValues}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          isExpanded={isOpen}
          onClick={() => {
            setOpen((open) => !open);
          }}
          ref={toggleRef}
          style={{ width }}
        >
          {t('Filter by {{activeFilterLabel}}', {
            activeFilterLabel: attribute.label.toLocaleLowerCase(),
          })}
          {selected.size ? <Badge isRead>{selected.size}</Badge> : null}
        </MenuToggle>
      )}
    >
      <SelectList isAriaMultiselectable>
        {attribute.options.map((option) => (
          <SelectOption
            hasCheckbox
            isSelected={selected.has(option.id)}
            key={option.id}
            value={option.id}
          >
            <Split>
              {option.icon ? <SplitItem className="pf-v6-u-mr-sm">{option.icon}</SplitItem> : null}
              <SplitItem>{option.label ?? option.id}</SplitItem>
            </Split>
          </SelectOption>
        ))}
      </SelectList>
    </PfSelect>
  );
};

export default FilterValueMultiSelect;
