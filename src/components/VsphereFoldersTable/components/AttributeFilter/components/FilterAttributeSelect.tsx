import { type Ref, useMemo, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import type { AttributeConfig } from '../utils/types';

type FilterAttributeSelectProps<T> = {
  activeId?: string;
  attributes: AttributeConfig<T>[];
  onChange: (id: string) => void;
};

const FilterAttributeSelect = <T,>({
  activeId,
  attributes,
  onChange,
}: FilterAttributeSelectProps<T>) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setOpen] = useState(false);

  const active = useMemo(
    () => attributes.find((a) => a.id === activeId) ?? attributes[0],
    [attributes, activeId],
  );

  return (
    <PfSelect
      id="filter-attribute-select"
      isOpen={isOpen}
      onOpenChange={(open) => {
        setOpen(open);
      }}
      onSelect={(_e, value) => {
        onChange(String(value));
        setOpen(false);
      }}
      selected={active?.id}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          data-testid="filter-attribute-toggle"
          icon={<FilterIcon />}
          isExpanded={isOpen}
          onClick={() => {
            setOpen((open) => !open);
          }}
          ref={toggleRef}
        >
          {active?.label ?? t('Select filter type')}
        </MenuToggle>
      )}
    >
      <SelectList>
        {attributes.map((attr) => (
          <SelectOption key={attr.id} value={attr.id}>
            {attr.label}
          </SelectOption>
        ))}
      </SelectList>
    </PfSelect>
  );
};

export default FilterAttributeSelect;
