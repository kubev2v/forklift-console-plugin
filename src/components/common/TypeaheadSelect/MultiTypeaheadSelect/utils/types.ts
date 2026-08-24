import type { ReactNode } from 'react';

import type { MenuToggleProps, SelectProps } from '@patternfly/react-core';

import type { TypeaheadSelectOption } from '../../utils/types';

export type MultiTypeaheadSelectProps = {
  allowClear?: boolean;
  createOptionMessage?: string | ((value: string) => string);
  emptyState?: ReactNode;
  filterControls?: ReactNode;
  footer?: ReactNode;
  isCreatable?: boolean;
  isDisabled?: boolean;
  listboxId?: string;
  maxSelections?: number;
  noOptionsMessage?: string;
  noResultsMessage?: string | ((filter: string) => string);
  onChange: (values: (string | number)[]) => void;
  onCreateOption?: (createdValue: string) => void;
  onInputChange?: (inputValue: string) => void;
  options: TypeaheadSelectOption[];
  placeholder?: string;
  testId?: string;
  toggleProps?: Omit<MenuToggleProps, 'innerRef' | 'onClick' | 'isExpanded' | 'variant'>;
  toggleWidth?: string;
  values?: (string | number)[];
} & Omit<SelectProps, 'toggle' | 'onSelect' | 'selected' | 'isOpen'>;
