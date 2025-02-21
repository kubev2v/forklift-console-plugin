import React, { MouseEvent as ReactMouseEvent, Ref, useState } from 'react';

import {
  Badge,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  ToolbarFilter,
} from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';

import { FilterTypeProps } from './types';

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
  selectedFilters: selectedEnumIds = [],
  onFilterUpdate: onSelectedEnumIdsChange,
  supportedValues: supportedEnumValues = [],
  supportedGroups = [],
  placeholderLabel,
  showFilter = true,
  showFilterIcon,
  hasMultipleResources,
}: FilterTypeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // simplify lookup
  const id2enum = Object.fromEntries(
    supportedEnumValues.map(({ id, ...rest }) => [id, { id, ...rest }]),
  );

  const label2enum = Object.fromEntries(
    supportedEnumValues.map(({ label, ...rest }) => [label, { label, ...rest }]),
  );

  const deleteGroup = (groupId: string): void => {
    let newSelectedValues = selectedEnumIds.filter(
      (id) => id2enum[id] && id2enum[id].groupId !== groupId,
    );
    let selectedResourceId;

    if (hasMultipleResources) {
      newSelectedValues = [];
      selectedResourceId = groupId;
    }

    onSelectedEnumIdsChange(newSelectedValues, selectedResourceId);
  };

  const deleteFilter = (id: string): void => {
    let newSelectedValues = selectedEnumIds.filter((id) => id2enum[id] && id !== id);

    if (hasMultipleResources) {
      newSelectedValues = selectedEnumIds.filter(
        (selectedId) =>
          id2enum[selectedId]?.resourceFieldId === id2enum[id]?.resourceFieldId &&
          selectedId !== id,
      );
    }

    onSelectedEnumIdsChange(newSelectedValues, id2enum[id].resourceFieldId);
  };

  const hasFilter = (id: string): boolean =>
    !!id2enum[id] && !!selectedEnumIds.find((enumId) => enumId === id);

  const addFilter = (id: string): void => {
    let newSelectedValues = [...selectedEnumIds.filter((id) => id2enum[id]), id];

    if (hasMultipleResources) {
      newSelectedValues = [
        ...selectedEnumIds.filter(
          (selectedId) => id2enum[selectedId]?.resourceFieldId === id2enum[id]?.resourceFieldId,
        ),
        id,
      ];
    }

    onSelectedEnumIdsChange(newSelectedValues, id2enum[id].resourceFieldId);
  };

  const onSelect = (
    _event: ReactMouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    const label = value?.toString();
    const id = label2enum?.[label] ? label2enum[label]?.id : label;
    hasFilter(id) ? deleteFilter(id) : addFilter(id);
  };

  const onToggleClick = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isFullWidth
      {...(showFilterIcon && { icon: <FilterIcon /> })}
    >
      {placeholderLabel}
      {selectedEnumIds.length > 0 && <Badge isRead>{selectedEnumIds.length}</Badge>}
    </MenuToggle>
  );

  const renderOptions = () =>
    supportedGroups.map(({ label, groupId }) => (
      <SelectGroup key={groupId} label={label}>
        <SelectList>
          {supportedEnumValues
            .filter((item) => item.groupId === groupId)
            .map(({ id, label }) => (
              <SelectOption
                hasCheckbox
                key={id}
                value={label}
                isSelected={selectedEnumIds.includes(id)}
              >
                {label}
              </SelectOption>
            ))}
        </SelectList>
      </SelectGroup>
    ));

  return (
    <>
      {/**
       * use nested ToolbarFilter trick borrowed from the Openshift Console filter-toolbar:
       * 1. one Select belongs to multiple ToolbarFilters.
       * 2. each ToolbarFilter provides a different chip category
       * 3. a chip category maps to group within the Select */}
      {supportedGroups.reduce(
        (acc, { label, groupId }) => (
          <ToolbarFilter
            chips={selectedEnumIds
              .filter((id) => id2enum[id])
              .map((id) => id2enum[id])
              .filter((enumVal) => enumVal.groupId === groupId)
              .map(({ id, label }) => ({ key: id, node: label }))}
            deleteChip={(category, option) => {
              // values are one enum so id is enough to identify (category is not needed)
              const id = typeof option === 'string' ? option : option.key;
              deleteFilter(id);
            }}
            deleteChipGroup={(category) => {
              const groupId = typeof category === 'string' ? category : category.key;
              deleteGroup(groupId);
            }}
            categoryName={{ key: groupId, name: label }}
            showToolbarItem={showFilter}
          >
            {acc}
          </ToolbarFilter>
        ),
        <Select
          role="menu"
          aria-label={placeholderLabel}
          isOpen={isOpen}
          selected={supportedEnumValues.filter(({ id }) => selectedEnumIds.includes(id))}
          onSelect={onSelect}
          onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
          toggle={toggle}
          shouldFocusToggleOnSelect
          shouldFocusFirstItemOnOpen={false}
          popperProps={{
            direction: 'down',
            enableFlip: true,
          }}
        >
          <SelectList>{renderOptions()}</SelectList>
        </Select>,
      )}
    </>
  );
};
