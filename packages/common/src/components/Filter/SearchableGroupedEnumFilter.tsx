import React from 'react';

import { GroupedEnumFilter } from './GroupedEnumFilter';
import { FilterTypeProps } from './types';

/**
 * A GroupedEnumFilter component that supports type-ahead functionality, allowing users to input a search inside
 * the toggle for filtering down from the list of menu options shown. This is especially useful for very long lists that would be inconvenient for the user to scroll through.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/SearchableGroupedEnumFilter.tsx)
 */
export const SearchableGroupedEnumFilter = (props: FilterTypeProps) => (
  <GroupedEnumFilter {...props} hasInlineFilter={true} />
);
