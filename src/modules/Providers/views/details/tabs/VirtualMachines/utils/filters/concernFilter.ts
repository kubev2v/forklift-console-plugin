import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';

import type { EnumValue } from '@components/common/utils/types';

export const concernFilter = (t: (string) => string) => ({
  dynamicFilter: (items: { vm: { concerns: { label: string }[] } }[]) => ({
    values: [
      ...EnumToTuple({
        Critical: 'Critical',
        Information: 'Information',
        Warning: 'Warning',
      }).map(({ id, label }: EnumValue): EnumValue => ({ groupId: 'category', id, label })),
      ...Array.from(
        new Set(
          items
            .filter((item) => item?.vm?.concerns?.length)
            .flatMap((item) => item.vm.concerns)
            .map((concern) => concern.label),
        ),
      ) // At this point the list contains unique strings that can be used as ID
        .map((label: string): EnumValue => ({ groupId: 'label', id: label, label })),
    ],
  }),
  groups: [
    { groupId: 'category', label: t('Category') },
    { groupId: 'label', label: t('Concern') },
  ],
  placeholderLabel: t('Concerns'),
  primary: true,
  type: 'concerns',
});
