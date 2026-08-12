import type { SelectOptionProps } from '@patternfly/react-core';

export type TypeaheadSelectOption = {
  content: string | number;
  optionProps?: Omit<SelectOptionProps, 'content' | 'value'> & {
    testId?: string;
  };
  value: string | number;
};

export type FilterOptionsConfig = {
  createOptionMessage: string | ((value: string) => string);
  filterFunction: (
    filterValue: string,
    options: TypeaheadSelectOption[],
  ) => TypeaheadSelectOption[];
  inputValue: string;
  isCreatable: boolean;
  isFiltering: boolean;
  noResultsMessage: string | ((filter: string) => string);
  options: TypeaheadSelectOption[];
};
