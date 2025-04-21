import { enumToTuple } from 'src/components/common/FilterGroup/helpers';

import type { EnumValue } from '@components/common/utils/types';
import { t } from '@utils/i18n';

export const concernFilter = () => ({
  dynamicFilter: (items: { vm: { concerns: { label: string }[] } }[]) => ({
    values: [
      ...enumToTuple({
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
      ) // at this point the list contains unique strings that can be used as ID
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
