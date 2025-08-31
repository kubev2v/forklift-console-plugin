import { COLUMN_IDS } from '@components/VsphereFoldersTable/utils/types';
import {
  SearchInput,
  type ToolbarChip,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import FilterAttributeSelect from './components/FilterAttributeSelect';
import FilterValueMultiSelect from './components/FilterValueMultiSelect';
import type { AttributeFilters } from './hooks/useAttributeFilters';
import { type AttributeConfig, AttributeKind } from './utils/types';

type AttributeFiltersToolbarProps<T> = {
  attributes: AttributeConfig<T>[];
} & AttributeFilters<T>;

export const AttributeFiltersToolbar = <T,>({
  activeId,
  attributes,
  checks,
  chipsByAttr,
  clearText,
  deleteChip,
  deleteChipGroup,
  setActiveId,
  setTextValue,
  text,
  toggleCheck,
}: AttributeFiltersToolbarProps<T>) => {
  const { t } = useForkliftTranslation();
  const active = attributes.find((attr) => attr.id === activeId) ?? attributes[0];

  const checkboxSelect =
    active?.kind === AttributeKind.Checkbox ? (
      <FilterValueMultiSelect
        attribute={active}
        selected={checks[active.id] ?? new Set<string>()}
        onToggle={(optId) => {
          toggleCheck(active.id, optId);
        }}
        closeKey={active.id}
      />
    ) : null;

  const filterGroups = attributes.map((attr) => {
    const chips = chipsByAttr[attr.id] ?? [];
    return (
      <ToolbarFilter
        key={attr.id}
        categoryName={attr.label}
        chips={chips}
        deleteChip={(_c: unknown, chip: string | ToolbarChip) => {
          if (typeof chip === 'string') {
            deleteChip(attr.id, chip);
          } else if (typeof chip.node === 'string') {
            deleteChip(attr.id, chip.node);
          }
        }}
        deleteChipGroup={() => {
          deleteChipGroup(attr.id);
        }}
        showToolbarItem={activeId === attr.id}
      >
        {attr.kind === AttributeKind.Text ? (
          <SearchInput
            placeholder={t('Filter by {{activeFilterLabel}}', {
              activeFilterLabel:
                active.id === COLUMN_IDS.Name ? active.label : active.label.toLocaleLowerCase(),
            })}
            value={text[attr.id] ?? ''}
            onChange={(_e, value) => {
              setTextValue(attr.id, value);
            }}
            onClear={() => {
              clearText(attr.id);
            }}
          />
        ) : (
          checkboxSelect
        )}
      </ToolbarFilter>
    );
  });

  return (
    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>
          <FilterAttributeSelect
            attributes={attributes}
            activeId={activeId}
            onChange={setActiveId}
          />
        </ToolbarItem>
        {filterGroups}
      </ToolbarGroup>
    </ToolbarToggleGroup>
  );
};
