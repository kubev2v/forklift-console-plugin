import { EnumToTuple } from 'src/components/common/FilterGroup/helpers';

import { EnumValue } from '@components/common/utils/types';

export const concernFilter = (t: (string) => string) => ({
  type: 'concerns',
  primary: true,
  placeholderLabel: t('Concerns'),
  groups: [
    { groupId: 'category', label: t('Category') },
    { groupId: 'label', label: t('Concern') },
  ],
  dynamicFilter: (items: { vm: { concerns: { label: string }[] } }[]) => ({
    values: [
      ...EnumToTuple({
        Critical: 'Critical',
        Warning: 'Warning',
        Information: 'Information',
      }).map(({ id, label }: EnumValue): EnumValue => ({ id, label, groupId: 'category' })),
      ...Array.from(
        new Set(
          items
            .filter((item) => item?.vm?.concerns?.length)
            .flatMap((item) => item.vm.concerns)
            .map((concern) => concern.label),
        ),
      ) // at this point the list contains unique strings that can be used as ID
        .map((label: string): EnumValue => ({ groupId: 'label', id: label, label })),
    ],
  }),
});
