import type { ReactElement } from 'react';

import type { EnumGroup, EnumValue } from '@components/common/utils/types';
import { SelectGroup, SelectList, SelectOption } from '@patternfly/react-core';

export const renderGroupedEnumOptions = (
  supportedGroups: EnumGroup[],
  supportedEnumValues: EnumValue[],
  selectedEnumIds: string[],
): ReactElement[] =>
  supportedGroups.map(({ groupId, label }) => (
    <SelectGroup key={groupId} label={label}>
      <SelectList>
        {supportedEnumValues
          .filter((item) => item.groupId === groupId)
          .map(({ icon, id, label: itemLabel }) => (
            <SelectOption
              hasCheckbox
              isSelected={selectedEnumIds.includes(id)}
              key={id}
              value={itemLabel}
            >
              {icon} {itemLabel}
            </SelectOption>
          ))}
      </SelectList>
    </SelectGroup>
  ));
