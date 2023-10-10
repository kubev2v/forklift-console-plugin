import React, { FormEvent, useState } from 'react';
import { DateTime, Interval } from 'luxon';

import { DatePicker, InputGroup, ToolbarFilter } from '@patternfly/react-core';

import { FilterTypeProps } from './types';

/**
 * This Filter type enables selecting an exclusive date range.
 * Precisely given range [A,B) a date X in the range if A <= X < B.
 *
 * **FilterTypeProps are interpreted as follows**:<br>
 * 1) selectedFilters - date range encoded as ISO 8601 time interval string ("dateFrom/dateTo").<br>
 * 2) onFilterUpdate - accepts the list of ranges.<br>
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/DateRangeFilter.tsx)
 */
export const DateRangeFilter = ({
  selectedFilters = [],
  onFilterUpdate,
  title,
  filterId,
  placeholderLabel,
  showFilter = true,
}: FilterTypeProps) => {
  const validFilters =
    selectedFilters
      ?.map((str) => Interval.fromISO(str))
      ?.filter((range: Interval) => range.isValid) ?? [];

  const [from, setFrom] = useState<DateTime>();
  const [to, setTo] = useState<DateTime>();

  const rangeToOption = (range: Interval): string => range.toISODate().replace('/', ' - ');

  const optionToRange = (option: string): Interval => Interval.fromISO(option.replace(' - ', '/'));

  const clearSingleRange = (option) => {
    const target = optionToRange(option);
    onFilterUpdate([
      ...validFilters.filter((range) => range.equals(target)).map((range) => range.toISODate()),
    ]);
  };

  const onFromDateChange = (even: FormEvent<HTMLInputElement>, value: string) => {
    if (value?.length === 10 && DateTime.fromISO(value).isValid) {
      setFrom(DateTime.fromISO(value));
      setTo(undefined);
    }
  };

  const onToDateChange = (even: FormEvent<HTMLInputElement>, value: string) => {
    if (value?.length === 10 && DateTime.fromISO(value).isValid) {
      const newTo = DateTime.fromISO(value);
      setTo(newTo);
      const target = Interval.fromDateTimes(from, newTo);
      if (target.isValid) {
        onFilterUpdate(
          [...validFilters.filter((range) => !range.equals(target)), target].map((range) =>
            range.toISODate(),
          ),
        );
      }
    }
  };
  return (
    <ToolbarFilter
      key={filterId}
      chips={validFilters.map(rangeToOption)}
      deleteChip={(category, option) => clearSingleRange(option)}
      deleteChipGroup={() => onFilterUpdate([])}
      categoryName={title}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <DatePicker
          value={from?.toISODate()}
          dateFormat={(date) => DateTime.fromJSDate(date).toISODate()}
          dateParse={(str) => DateTime.fromISO(str).toJSDate()}
          onChange={onFromDateChange}
          aria-label={'Interval start'}
          placeholder={placeholderLabel}
          // disable error text (no space in toolbar scenario)
          invalidFormatText={''}
          // default value ("parent") creates collision with sticky table header
          appendTo={document.body}
        />
        <DatePicker
          value={to?.toISODate()}
          onChange={onToDateChange}
          // disable error text (no space in toolbar scenario)
          invalidFormatText={''}
          isDisabled={!from?.isValid}
          rangeStart={from?.toJSDate()}
          aria-label="Interval end"
          placeholder="YYYY-MM-DD"
          appendTo={document.body}
        />
      </InputGroup>
    </ToolbarFilter>
  );
};
