import React from 'react';

import { EnumFilter } from './EnumFilter';
import { FilterTypeProps } from './types';

/**
 * An EnumFilter component that supports a type-ahead functionality, allowing users to input a search inside
 * the toggle for filtering down from the list of menu options shown. This is especially useful for very long lists that would be inconvenient for the user to scroll through.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/SearchableEnumFilter.tsx)
 */
export const SearchableEnumFilter = (props: FilterTypeProps) => (
  <EnumFilter {...props} hasInlineFilter={true} />
);
