import type { EnumValue } from '@components/common/utils/types';

const labelToFilterItem = (label: string): EnumValue =>
  label !== '' ? { id: label, label } : { id: label, label: 'Undefined' };

/**
 * This component enables filtering the VMware's virtual machines
 * by the hostname that they are running on.
 */
export const VsphereHostFilter = (t: (string) => string) => {
  return {
    dynamicFilter: (items: { hostName: string }[]) => ({
      values: [
        ...Array.from(new Set(items.map((item) => item.hostName))) // At this point the list contains unique strings that can be used as ID
          .map(labelToFilterItem),
      ],
    }),
    placeholderLabel: t('Host'),
    primary: true,
    type: 'host',
  };
};
