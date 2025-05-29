import type { FormEvent } from 'react';

import { Switch, ToolbarItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { FilterTypeProps } from './types';

import './SwitchFilter.scss';

/**
 * Simple boolean filter without support for filter chips.
 *
 * FilterTypeProps are interpreted as follows:<br>
 * 1) selectedFilters - input array with single string 'true' is interpreted as 'true' state, otherwise 'false' state is assumed.<br>
 * 2) onFilterUpdate - receives array with single string 'true' or empty array.<br>
 * 3) placeholderLabel - used for both on/off states.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/SwitchFilter.tsx)
 */
export const SwitchFilter = ({
  onFilterUpdate,
  placeholderLabel,
  selectedFilters,
}: FilterTypeProps) => {
  const onChange: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (checked) => {
    onFilterUpdate(checked ? [Boolean(checked).toString()] : []);
  };

  return (
    <ToolbarItem className="forklift-switch-filter">
      <Switch
        label={placeholderLabel}
        isChecked={!isEmpty(selectedFilters) && selectedFilters?.[0] === 'true'}
        onChange={(e, value) => {
          onChange(value, e);
        }}
      />
    </ToolbarItem>
  );
};
