import { type FormEvent, useState } from 'react';

import { DatePicker, InputGroup, ToolbarFilter } from '@patternfly/react-core';

import { changeFormatToISODate, isValidDate, parseISOtoJSDate, toISODate } from '../utils/dates';

import type { FilterTypeProps } from './types';

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
  filterId,
  onFilterUpdate,
  placeholderLabel,
  selectedFilters = [],
  showFilter = true,
  title,
}: FilterTypeProps) => {
  const isString = (value: string | undefined): value is string => value !== undefined;
  const validFilters = selectedFilters?.map(changeFormatToISODate)?.filter(isString) ?? [];

  // internal state - stored as ISO date string (no time)
  const [date, setDate] = useState<string | undefined>();

  const clearSingleDate = (option: string) => {
    onFilterUpdate([...validFilters.filter((filter) => filter !== option)]);
  };

  const onDateChange: (event: FormEvent<HTMLInputElement>, value: string, date?: Date) => void = (
    _event,
    value,
  ) => {
    // require full format "YYYY-MM-DD" although partial date is also accepted
    // i.e. YYYY-MM gets parsed as YYYY-MM-01 and results in auto completing the date
    // unfortunately due to auto-complete user cannot delete the date char after char
    if (value?.length === 10 && isValidDate(value)) {
      const targetDate = changeFormatToISODate(value);
      setDate(targetDate);
      if (targetDate) {
        onFilterUpdate([...validFilters.filter((filter) => filter !== targetDate), targetDate]);
      }
    }
  };

  return (
    <ToolbarFilter
      key={filterId}
      labels={validFilters}
      deleteLabel={(_category, option) => {
        clearSingleDate(option as string);
      }}
      deleteLabelGroup={() => onFilterUpdate([])}
      categoryName={title ?? ''}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <DatePicker
          value={date}
          dateFormat={(newDate: Date) => toISODate(newDate) ?? ''}
          dateParse={(value: string) => parseISOtoJSDate(value) ?? new Date()}
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
