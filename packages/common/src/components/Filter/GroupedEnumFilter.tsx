import React, { useState } from 'react';

import {
  Select,
  SelectGroup,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarFilter,
} from '@patternfly/react-core';

import { EnumValue } from '../../utils';

import { FilterTypeProps, InlineFilter } from './types';

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
  hasInlineFilter = false,
}: FilterTypeProps & InlineFilter) => {
  const [isExpanded, setExpanded] = useState(false);

  // simplify lookup
  const id2enum = Object.fromEntries(
    supportedEnumValues.map(({ id, ...rest }) => [id, { id, ...rest }]),
  );

  const deleteGroup = (groupId: string): void =>
    onSelectedEnumIdsChange(
      selectedEnumIds
        .filter((id) => id2enum[id])
        .filter((enumId) => id2enum[enumId].groupId !== groupId),
    );

  const deleteFilter = (id: string): void =>
    onSelectedEnumIdsChange(
      selectedEnumIds.filter((id) => id2enum[id]).filter((enumId) => enumId !== id),
    );

  const hasFilter = (id: string): boolean =>
    !!id2enum[id] && !!selectedEnumIds.find((enumId) => enumId === id);

  const addFilter = (id: string): void => {
    onSelectedEnumIdsChange([...selectedEnumIds.filter((id) => id2enum[id]), id]);
  };

  // put the IDs needed for compareTo (although not part of the interface)
  const toSelectOption = ({ id, groupId, label }): SelectOptionObject =>
    ({
      toString: () => label,
      id,
      groupId,
      compareTo: (option) => option.id === id && option.groupId === groupId,
    } as SelectOptionObject);

  const options = supportedGroups.map(({ label, groupId }) => (
    <SelectGroup key={groupId} label={label}>
      {supportedEnumValues
        .filter((item) => item.groupId === groupId)
        .map(({ id, label }) => (
          <SelectOption key={id} value={toSelectOption({ id, label, groupId })} />
        ))}
    </SelectGroup>
  ));

  const onFilter = (_, textInput) => {
    if (textInput === '') {
      return options;
    }

    const filteredGroups = options
      .map((group) => {
        const filteredGroup = React.cloneElement(group, {
          children: group.props.children.filter((item) => {
            // options are not plain strings but the our toString() method
            // converts them in a meaningful way
            return item.props.value.toString().toLowerCase().includes(textInput.toLowerCase());
          }),
        });
        if (filteredGroup.props.children.length > 0) return filteredGroup;
      })
      .filter((newGroup) => newGroup);
    return filteredGroups;
  };

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
          variant={SelectVariant.checkbox}
          isGrouped
          aria-label={placeholderLabel}
          onSelect={(event, option, isPlaceholder) => {
            if (isPlaceholder) {
              return;
            }
            const id = typeof option === 'string' ? option : (option as EnumValue).id;
            hasFilter(id) ? deleteFilter(id) : addFilter(id);
          }}
          selections={supportedEnumValues
            .filter(({ id }) => selectedEnumIds.includes(id))
            .map(toSelectOption)}
          placeholderText={placeholderLabel}
          isOpen={isExpanded}
          onToggle={setExpanded}
          hasInlineFilter={hasInlineFilter}
          onFilter={onFilter}
        >
          {options}
        </Select>,
      )}
    </>
  );
};
