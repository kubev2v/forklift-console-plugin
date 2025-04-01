import React from 'react';

import { ToolbarGroup } from '@patternfly/react-core';

import { FilterFromDef } from './FilterFromDef';
import type { MetaFilterProps } from './types';

/**
 * This is an implementation of [<font>``PatternFly 4`` filter group</font>](https://www.patternfly.org/v4/demos/filters/design-guidelines/#filter-group) pattern,
 * extended to use any filter matching FilterTypeProps interface (not only enum based selection but also free text, boolean switch and grouped enum based).
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/FilterGroup/FilterGroup.tsx)
 *
 * @see FilterTypeProps
 */
export const FilterGroup = ({
  fieldFilters,
  onFilterUpdate,
  resolvedLanguage = 'en',
  selectedFilters = {},
  supportedFilterTypes,
}: MetaFilterProps) => (
  <ToolbarGroup variant="filter-group">
    {fieldFilters.map(({ filterDef, label, resourceFieldId }) => (
      <FilterFromDef
        key={resourceFieldId}
        {...{
          filterDef,
          FilterType: supportedFilterTypes[filterDef.type],
          label,
          onFilterUpdate,
          resolvedLanguage,
          resourceFieldId,
          selectedFilters,
        }}
      />
    ))}
  </ToolbarGroup>
);
