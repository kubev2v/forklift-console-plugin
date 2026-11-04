import { type FormEvent, type ReactElement, useContext, useState } from 'react';
import { DateTime } from 'luxon';

import { ResetContext } from '@components/common/FilterGroup/resetFieldContext';
import {
  DatePicker,
  InputGroup,
  isValidDate as isValidJSDate,
  ToolbarFilter,
  type ToolbarLabel,
  Tooltip,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

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
  selectedFilters,
  showFilter = true,
  title,
}: FilterTypeProps): ReactElement => {
  const resetSig = useContext(ResetContext);
  const [prevResetSig, setPrevResetSig] = useState(resetSig);
  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();

  if (prevResetSig !== resetSig) {
    setPrevResetSig(resetSig);
    setFrom(undefined);
    setTo(undefined);
  }
  const validFilters = selectedFilters?.filter(isValidInterval) ?? [];

  const rangeToOption = (range: string): { key: string; node: ReactElement } => {
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

  const clearSingleRange = (option: ToolbarLabel): void => {
    const target = optionToRange(option);
    const remainingFilters = validFilters.filter((range) => range !== target);
    const displayedRange = from && to ? toISODateInterval(from, to) : undefined;

    if (isEmpty(remainingFilters) || target === displayedRange) {
      setFrom(undefined);
      setTo(undefined);
    }
    onFilterUpdate(remainingFilters);
  };

  const clearEveryRange = (): void => {
    setFrom(undefined);
    setTo(undefined);
    onFilterUpdate([]);
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
      categoryName={title as unknown as string}
      deleteLabel={(category, option) => {
        clearSingleRange(option as ToolbarLabel);
      }}
      deleteLabelGroup={clearEveryRange}
      key={filterId}
      labels={validFilters.map(rangeToOption)}
      showToolbarItem={showFilter}
    >
      <InputGroup>
        <DatePicker
          // default value ("parent") creates collision with sticky table header
          appendTo={document.body}
          aria-label="Interval start"
          dateFormat={(date: Date) => DateTime.fromJSDate(date).toISODate() ?? ''}
          dateParse={(str: string) => DateTime.fromISO(str).toJSDate()}
          // disable error text (no space in toolbar scenario)
          invalidFormatText={''}
          key={`from-${resetSig}`}
          onChange={onFromDateChange}
          placeholder={placeholderLabel}
          popoverProps={{
            footerContent: helperText,
          }}
          value={from ? toISODate(from) : undefined}
        />
        <DatePicker
          appendTo={document.body}
          aria-label="Interval end"
          dateFormat={(date: Date) => DateTime.fromJSDate(date).toISODate() ?? ''}
          dateParse={(str: string) => DateTime.fromISO(str).toJSDate()}
          // disable error text (no space in toolbar scenario)
          invalidFormatText={''}
          isDisabled={!isValidJSDate(from)}
          key={`to-${resetSig}`}
          onChange={onToDateChange}
          placeholder={placeholderLabel}
          popoverProps={{
            footerContent: helperText,
          }}
          rangeStart={from}
          value={to ? toISODate(to) : undefined}
        />
      </InputGroup>
    </ToolbarFilter>
  );
};
