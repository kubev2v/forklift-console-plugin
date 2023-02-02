import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectProps,
  SelectOptionProps,
} from '@patternfly/react-core';

import './SimpleSelect.css';

export interface OptionWithValue<T = string> extends SelectOptionObject {
  value: T;
  props?: Partial<SelectOptionProps>; // Extra props for <SelectOption>, e.g. children, className
}

type OptionLike = string | SelectOptionObject | OptionWithValue;

export interface ISimpleSelectProps
  extends Omit<
    SelectProps,
    'onChange' | 'isExpanded' | 'onToggle' | 'onSelect' | 'selections' | 'value'
  > {
  'aria-label': string;
  onChange: (selection: OptionLike) => void;
  options: OptionLike[];
  value: OptionLike | OptionLike[];
}

export const SimpleSelect: React.FunctionComponent<ISimpleSelectProps> = ({
  onChange,
  options,
  value,
  placeholderText = 'Select...',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Select
      placeholderText={placeholderText}
      isOpen={isOpen}
      onToggle={setIsOpen}
      onSelect={(event, selection: OptionLike) => {
        onChange(selection);
        setIsOpen(false);
      }}
      selections={value}
      {...props}
    >
      {options.map((option, index) => (
        <SelectOption
          key={`${index}-${option.toString()}`}
          value={option}
          {...(typeof option === 'object' && (option as OptionWithValue).props)}
        />
      ))}
    </Select>
  );
};
