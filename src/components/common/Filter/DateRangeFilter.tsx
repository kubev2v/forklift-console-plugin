import { type FormEvent, useState } from 'react';
import { DateTime } from 'luxon';

import {
  DatePicker,
  InputGroup,
  isValidDate as isValidJSDate,
  ToolbarFilter,
  type ToolbarLabel,
  Tooltip,
} from '@patternfly/react-core';

import {
  isValidDate,
  isValidInterval,
  localizeInterval,
  parseISOtoJSDate,
  toISODate,
  toISODateInterval,
} from '../utils/dates';

import type { FilterTypeProps } from './types';

/**
 * This Filter type enables selecting an closed date range.
 * Precisely given range [A,B] a date X in the range if A <= X <= B.
 *
 * **FilterTypeProps are interpreted as follows**:<br>
 * 1) selectedFilters - date range encoded as ISO 8601 time interval string ("dateFrom/dateTo"). Only date part is used (no time).<br>
 * 2) onFilterUpdate - accepts the list of ranges.<br>
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/DateRangeFilter.tsx)
 */
export const DateRangeFilter = ({
  filterId,
  helperText,
  onFilterUpdate,
  placeholderLabel,
  selectedFilters = [],
  showFilter = true,
  title,
}: FilterTypeProps) => {
  const validFilters = selectedFilters?.filter(isValidInterval) ?? [];

  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();

  const rangeToOption = (range: string) => {
    const formatted = localizeInterval(range);
    return {
      key: range,
      node: (
        <Tooltip content={formatted}>
          <span>{formatted ?? ''}</span>
        </Tooltip>
      ),
    };
  };
  const optionToRange = (option: ToolbarLabel): string => option?.key;

  const clearSingleRange = (option: ToolbarLabel) => {
    const target = optionToRange(option);
    onFilterUpdate([...validFilters.filter((range) => range !== target)]);
  };

  const onFromDateChange: (
    event: FormEvent<HTMLInputElement>,
    value: string,
    date?: Date,
  ) => void = (_event, value) => {
    //see DateFilter onDateChange
    if (value?.length === 10 && isValidDate(value)) {
      setFrom(parseISOtoJSDate(value));
      setTo(undefined);
    }
  };

  const onToDateChange: (event: FormEvent<HTMLInputElement>, value: string, date?: Date) => void = (
    _event,
    value,
  ) => {
    //see DateFilter onDateChange
    if (value?.length === 10 && isValidDate(value)) {
      const newTo = parseISOtoJSDate(value);
      setTo(newTo);
      const target = from && newTo ? toISODateInterval(from, newTo) : undefined;
      if (target) {
        onFilterUpdate([...validFilters.filter((range) => range !== target), target]);
      }
    }
  };

  return (
    <ToolbarFilter
      key={filterId}
      labels={validFilters.map(rangeToOption)}
      deleteLabel={(category, option) => {
        clearSingleRange(option as ToolbarLabel);
      }}
      deleteLabelGroup={() => onFilterUpdate([])}
      categoryName={title as unknown as string}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <DatePicker
          value={from ? toISODate(from) : undefined}
          dateFormat={(date: Date) => DateTime.fromJSDate(date).toISODate() || ''}
          dateParse={(str: string) => DateTime.fromISO(str).toJSDate()}
          onChange={onFromDateChange}
          aria-label="Interval start"
          placeholder={placeholderLabel}
          // disable error text (no space in toolbar scenario)
          invalidFormatText={''}
          // default value ("parent") creates collision with sticky table header
          appendTo={document.body}
          popoverProps={{
            footerContent: helperText,
          }}
        />
        <DatePicker
          value={to ? toISODate(to) : undefined}
          dateFormat={(date: Date) => DateTime.fromJSDate(date).toISODate() || ''}
          dateParse={(str: string) => DateTime.fromISO(str).toJSDate()}
          onChange={onToDateChange}
          isDisabled={!isValidJSDate(from)}
          // disable error text (no space in toolbar scenario)
          invalidFormatText={''}
          rangeStart={from}
          aria-label="Interval end"
          placeholder={placeholderLabel}
          appendTo={document.body}
          popoverProps={{
            footerContent: helperText,
          }}
        />
      </InputGroup>
    </ToolbarFilter>
  );
};
