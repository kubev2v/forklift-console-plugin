import React, { useState } from 'react';
import { useTranslation } from 'common/src/utils/i18n';

import {
  Select,
  SelectGroup,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarFilter,
} from '@patternfly/react-core';

import { EnumValue, FilterTypeProps } from './types';

/**
 * Select one or many enum values.
 *
 * Enum contract:
 * 1) values are grouped only for presentation and better user experience - logically it's one enum.
 * 2) enum IDs(not translated identifiers) are required to be constant and unique within the enum
 * 3) the translated labels are not checked for duplication and simply displayed.
 * 4) groups are expected not to overlap (one item may belong to only one group)
 * 5) items not assigned to any of the supported groups are skipped
 *
 *
 * FilterTypeProps are interpeted as follows:
 * 1) selectedFilters - selected enum IDs
 * 2) onFilterUpdate - accepts the list of selected enum IDs
 * 3) supportedValues - supported enum values
 */
export const GroupedEnumFilter = ({
  selectedFilters: selectedEnumIds = [],
  onFilterUpdate: onSelectedEnumIdsChange,
  supportedValues: supportedEnumValues = [],
  supportedGroups = [],
  placeholderLabel,
  showFilter,
}: FilterTypeProps) => {
  const [isExpanded, setExpanded] = useState(false);
  const { t } = useTranslation();

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
  const toSelectOption = ({ id, groupId, toLabel }): SelectOptionObject =>
    ({
      toString: () => toLabel(t),
      id,
      groupId,
      compareTo: (option) => option.id === id && option.groupId === groupId,
    } as SelectOptionObject);

  return (
    <>
      {/**
       * use nested ToolbarFilter trick borrowed from the Openshift Console filter-toolbar:
       * 1. one Select belongs to multiple ToolbarFilters.
       * 2. each ToolbarFilter provides a different chip category
       * 3. a chip category maps to group within the Select */}
      {supportedGroups.reduce(
        (acc, { toLabel, groupId }) => (
          <ToolbarFilter
            chips={selectedEnumIds
              .filter((id) => id2enum[id])
              .map((id) => id2enum[id])
              .filter((enumVal) => enumVal.groupId === groupId)
              .map(({ id, toLabel }) => ({ key: id, node: toLabel(t) }))}
            deleteChip={(category, option) => {
              // values are one enum so id is enough to identify (category is not needed)
              const id = typeof option === 'string' ? option : option.key;
              deleteFilter(id);
            }}
            deleteChipGroup={(category) => {
              const groupId = typeof category === 'string' ? category : category.key;
              deleteGroup(groupId);
            }}
            categoryName={{ key: groupId, name: toLabel(t) }}
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
        >
          {supportedGroups.map(({ toLabel, groupId }) => (
            <SelectGroup key={groupId} label={toLabel(t)}>
              {supportedEnumValues
                .filter((item) => item.groupId === groupId)
                .map(({ id, toLabel }) => (
                  <SelectOption key={id} value={toSelectOption({ id, toLabel, groupId })} />
                ))}
            </SelectGroup>
          ))}
        </Select>,
      )}
    </>
  );
};
