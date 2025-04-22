import { type FormEvent, useState } from 'react';
import { DateTime } from 'luxon';

import {
  DatePicker,
  InputGroup,
  isValidDate as isValidJSDate,
  type ToolbarChip,
  ToolbarFilter,
  Tooltip,
} from '@patternfly/react-core';

import {
  abbreviateInterval,
  isValidDate,
  isValidInterval,
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
    const abbr = abbreviateInterval(range);
    return {
      key: range,
      node: (
        <Tooltip content={range}>
          <span>{abbr ?? ''}</span>
        </Tooltip>
      ),
    };
  };
  const optionToRange = (option: ToolbarChip): string => option?.key;

  const clearSingleRange = (option: ToolbarChip) => {
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
      const target = toISODateInterval(from, newTo);
      if (target) {
        onFilterUpdate([...validFilters.filter((range) => range !== target), target]);
      }
    }
  };

  return (
    <ToolbarFilter
      key={filterId}
      chips={validFilters.map(rangeToOption)}
      deleteChip={(category, option) => {
        clearSingleRange(option as ToolbarChip);
      }}
      deleteChipGroup={() => onFilterUpdate([])}
      categoryName={title as unknown as string}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <DatePicker
          value={toISODate(from)}
          dateFormat={(date) => DateTime.fromJSDate(date).toISODate()}
          dateParse={(str) => DateTime.fromISO(str).toJSDate()}
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
          value={toISODate(to)}
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
