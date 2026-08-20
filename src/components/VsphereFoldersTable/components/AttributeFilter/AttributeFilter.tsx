import type { ReactElement } from 'react';

import { COLUMN_IDS } from '@components/VsphereFoldersTable/utils/types';
import {
  SearchInput,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  type ToolbarLabel,
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
}: AttributeFiltersToolbarProps<T>): ReactElement => {
  const { t } = useForkliftTranslation();
  const active = attributes.find((attr) => attr.id === activeId) ?? attributes[0];

  const checkboxSelect =
    active?.kind === AttributeKind.Checkbox ? (
      <FilterValueMultiSelect
        attribute={active}
        closeKey={active.id}
        onToggle={(optId) => {
          toggleCheck(active.id, optId);
        }}
        selected={checks[active.id] ?? new Set<string>()}
      />
    ) : null;

  const filterGroups = attributes.map((attr) => {
    const chips = chipsByAttr[attr.id] ?? [];
    return (
      <ToolbarFilter
        categoryName={attr.label}
        deleteLabel={(_c: unknown, chip: string | ToolbarLabel) => {
          if (typeof chip === 'string') {
            deleteChip(attr.id, chip);
          } else if (typeof chip.node === 'string') {
            deleteChip(attr.id, chip.node);
          }
        }}
        deleteLabelGroup={() => {
          deleteChipGroup(attr.id);
        }}
        key={attr.id}
        labels={chips}
        showToolbarItem={activeId === attr.id}
      >
        {attr.kind === AttributeKind.Text ? (
          <SearchInput
            onChange={(_e, value) => {
              setTextValue(attr.id, value);
            }}
            onClear={() => {
              clearText(attr.id);
            }}
            placeholder={t('Filter by {{activeFilterLabel}}', {
              activeFilterLabel:
                active.id === COLUMN_IDS.Name ? active.label : active.label.toLocaleLowerCase(),
            })}
            value={text[attr.id] ?? ''}
          />
        ) : (
          checkboxSelect
        )}
      </ToolbarFilter>
    );
  });

  return (
    <ToolbarToggleGroup breakpoint="xl" toggleIcon={<FilterIcon />}>
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>
          <FilterAttributeSelect
            activeId={activeId}
            attributes={attributes}
            onChange={setActiveId}
          />
        </ToolbarItem>
        {filterGroups}
      </ToolbarGroup>
    </ToolbarToggleGroup>
  );
};
