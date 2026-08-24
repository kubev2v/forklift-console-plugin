import type { ReactElement, Ref } from 'react';

import { type MenuToggleElement, Select, SelectList, ToolbarFilter } from '@patternfly/react-core';

import { renderGroupedEnumOptions } from './components/GroupedEnumFilterOptions';
import GroupedEnumFilterToggle from './components/GroupedEnumFilterToggle';
import { useGroupedEnumFilter } from './hooks/useGroupedEnumFilter';
import { EMPTY_ENUM_IDS, EMPTY_ENUM_VALUES } from './utils/groupedEnumFilterConstants';
import type { FilterTypeProps } from './types';

/**
 * This Filter type enables selecting one or many enum values that are separated by groups.
 *
 * **Enum contract:**<br>
 * 1) values are grouped only for presentation and better user experience - logically it's one enum.<br>
 * 2) enum IDs(not translated identifiers) are required to be constant and unique within the enum.<br>
 * 3) the translated labels are not checked for duplication and simply displayed.<br>
 * 4) groups are expected not to overlap (one item may belong to only one group).<br>
 * 5) items not assigned to any of the supported groups are skipped.
 *
 *
 * **FilterTypeProps are interpreted as follows:**<br>
 * 1) selectedFilters - selected enum IDs.<br>
 * 2) onFilterUpdate - accepts the list of selected enum IDs.<br>
 * 3) supportedValues - supported enum values.<br>
 * 4) supportedGroups - groups for supported enum values.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/GroupedEnumFilter.tsx)
 */
export const GroupedEnumFilter = ({
  hasMultipleResources,
  onFilterUpdate,
  placeholderLabel,
  selectedFilters = EMPTY_ENUM_IDS,
  showFilter = true,
  showFilterIcon,
  supportedGroups,
  supportedValues: supportedEnumValues = EMPTY_ENUM_VALUES,
}: FilterTypeProps): ReactElement => {
  const {
    deleteFilter,
    deleteGroup,
    id2enum,
    isOpen,
    onSelect,
    onToggleClick,
    selectedEnumIds,
    setIsOpen,
  } = useGroupedEnumFilter({
    hasMultipleResources,
    onFilterUpdate,
    selectedFilters,
    supportedValues: supportedEnumValues,
  });

  const toggle = (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <GroupedEnumFilterToggle
      isOpen={isOpen}
      onToggleClick={onToggleClick}
      placeholderLabel={placeholderLabel}
      selectedCount={selectedEnumIds.length}
      showFilterIcon={showFilterIcon}
      toggleRef={toggleRef}
    />
  );

  return (
    <>
      {/**
       * use nested ToolbarFilter trick borrowed from the Openshift Console filter-toolbar:
       * 1. one Select belongs to multiple ToolbarFilters.
       * 2. each ToolbarFilter provides a different chip category
       * 3. a chip category maps to group within the Select */}
      {supportedGroups.reduce(
        (acc, { groupId, label }) => (
          <ToolbarFilter
            categoryName={{ key: groupId, name: label }}
            deleteLabel={(_category, option) => {
              const id = typeof option === 'string' ? option : option.key;
              deleteFilter(id);
            }}
            deleteLabelGroup={(category) => {
              const categoryId = typeof category === 'string' ? category : category.key;
              deleteGroup(categoryId);
            }}
            labels={selectedEnumIds
              .filter((id) => id2enum[id])
              .map((id) => id2enum[id])
              .filter((enumVal) => enumVal.groupId === groupId)
              .map(({ id, label: enumLabel }) => ({ key: id, node: enumLabel }))}
            showToolbarItem={showFilter}
          >
            {acc}
          </ToolbarFilter>
        ),
        // This select is different from most and cannot use the common Select
        // eslint-disable-next-line no-restricted-syntax
        <Select
          aria-label={placeholderLabel}
          isOpen={isOpen}
          onOpenChange={(nextOpen: boolean) => {
            setIsOpen(nextOpen);
          }}
          onSelect={onSelect}
          popperProps={{
            appendTo: document.body,
            direction: 'down',
            enableFlip: true,
          }}
          role="menu"
          selected={supportedEnumValues.filter(({ id }) => selectedEnumIds.includes(id))}
          shouldFocusFirstItemOnOpen={false}
          shouldFocusToggleOnSelect
          toggle={toggle}
        >
          <SelectList>
            {renderGroupedEnumOptions(supportedGroups, supportedEnumValues, selectedEnumIds)}
          </SelectList>
        </Select>,
      )}
    </>
  );
};
