import React from 'react';

import { EnumFilter } from './EnumFilter';
import { FilterTypeProps } from './types';

/**
 * EnumFilter with inline free search text enabled.
 */
export const SearchableEnumFilter = (props: FilterTypeProps) => (
  <EnumFilter {...props} hasInlineFilter={true} />
);
