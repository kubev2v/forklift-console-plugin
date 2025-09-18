import type { SelectOptionProps } from '@patternfly/react-core';

export type TypeaheadSelectOption = {
  content: string | number;
  value: string | number;
  optionProps?: Omit<SelectOptionProps, 'content' | 'value'>;
};

export type FilterOptionsConfig = {
  isFiltering: boolean;
  inputValue: string;
  options: TypeaheadSelectOption[];
  filterFunction: (
    filterValue: string,
    options: TypeaheadSelectOption[],
  ) => TypeaheadSelectOption[];
  isCreatable: boolean;
  createOptionMessage: string | ((value: string) => string);
  noResultsMessage: string | ((filter: string) => string);
};
