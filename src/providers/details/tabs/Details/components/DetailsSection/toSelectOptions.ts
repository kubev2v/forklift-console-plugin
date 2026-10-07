import type { SelectOptionProps } from '@patternfly/react-core';

export const toSelectOptions = (values: string[]): SelectOptionProps[] =>
  [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      children: value,
      itemId: value,
    }));
