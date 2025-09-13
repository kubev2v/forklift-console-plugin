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
  attributes: AttributeConfig<T>[];
  activeId?: string;
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
      selected={active?.id}
      onSelect={(_e, value) => {
        onChange(String(value));
        setOpen(false);
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
          icon={<FilterIcon />}
        >
          {active?.label ?? t('Select filter type')}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
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
