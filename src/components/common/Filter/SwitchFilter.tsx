import type { FormEvent } from 'react';

import { Switch, ToolbarFilter } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

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
  const { t } = useForkliftTranslation();

  const onChange: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (checked) => {
    onFilterUpdate(checked ? [Boolean(checked).toString()] : []);
  };

  const isChecked = (): boolean => !isEmpty(selectedFilters) && selectedFilters?.[0] === 'true';

  return (
    <ToolbarFilter
      chips={isChecked() ? [t('true')] : undefined}
      categoryName={placeholderLabel!}
      deleteChip={() => onFilterUpdate([])}
    >
      <Switch
        label={placeholderLabel}
        isChecked={isChecked()}
        onChange={(e, value) => {
          onChange(value, e);
        }}
      />
    </ToolbarFilter>
  );
};
