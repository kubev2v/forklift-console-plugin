import React from 'react';

import { GroupedEnumFilter } from './GroupedEnumFilter';
import { FilterTypeProps } from './types';

/**
 * GroupedEnumFilter with inline search enabled.
 */
export const SearchableGroupedEnumFilter = (props: FilterTypeProps) => (
  <GroupedEnumFilter {...props} hasInlineFilter={true} />
);
