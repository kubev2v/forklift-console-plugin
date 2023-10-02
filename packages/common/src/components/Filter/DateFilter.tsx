import React, { FormEvent, useState } from 'react';
import { DateTime } from 'luxon';

import { DatePicker, InputGroup, ToolbarFilter } from '@patternfly/react-core';

import { FilterTypeProps } from './types';

/**
 * This Filter type enables selecting a single date (a day).
 *
 * **FilterTypeProps are interpreted as follows**:<br>
 * 1) selectedFilters - dates in YYYY-MM-DD format (ISO date format).<br>
 * 2) onFilterUpdate - accepts the list of dates.<br>
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/DateFilter.tsx)
 */
export const DateFilter = ({
  selectedFilters = [],
  onFilterUpdate,
  title,
  filterId,
  placeholderLabel,
  showFilter = true,
}: FilterTypeProps) => {
  const validFilters =
    selectedFilters
      ?.map((str) => DateTime.fromISO(str))
      ?.filter((dt: DateTime) => dt.isValid)
      ?.map((dt: DateTime) => dt.toISODate()) ?? [];

  // internal state - stored as ISO date string (no time)
  const [date, setDate] = useState(DateTime.now().toISODate());

  const clearSingleDate = (option) => {
    onFilterUpdate([...validFilters.filter((d) => d !== option)]);
  };

  const onDateChange = (even: FormEvent<HTMLInputElement>, value: string) => {
    // require full format "YYYY-MM-DD" although partial date is also accepted
    // i.e. YYYY-MM gets parsed as YYYY-MM-01 and results in auto completing the date
    // unfortunately due to auto-complete user cannot delete the date char after char
    if (value?.length === 10 && DateTime.fromISO(value).isValid) {
      const targetDate = DateTime.fromISO(value).toISODate();
      setDate(targetDate);
      onFilterUpdate([...validFilters.filter((d) => d !== targetDate), targetDate]);
    }
  };

  return (
    <ToolbarFilter
      key={filterId}
      chips={validFilters}
      deleteChip={(category, option) => clearSingleDate(option)}
      deleteChipGroup={() => onFilterUpdate([])}
      categoryName={title}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <DatePicker
          value={DateTime.fromISO(date).toISODate()}
          dateFormat={(date) => DateTime.fromJSDate(date).toISODate()}
          dateParse={(str) => DateTime.fromISO(str).toJSDate()}
          onChange={onDateChange}
          aria-label={title}
          placeholder={placeholderLabel}
          invalidFormatText={placeholderLabel}
          // default value ("parent") creates collision with sticky table header
          appendTo={document.body}
        />
      </InputGroup>
    </ToolbarFilter>
  );
};
