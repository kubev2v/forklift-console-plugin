import { EnumValue } from '@forklift/common/utils/types';

const labelToFilterItem = (label: string): EnumValue =>
  label !== '' ? { id: label, label } : { id: label, label: 'Undefined' };

/**
 * This component enables filtering the VMware's virtual machines
 * by the hostname that they are running on.
 */
export const VsphereHostFilter = (t: (string) => string) => {
  return {
    type: 'host',
    primary: true,
    placeholderLabel: t('Host'),
    dynamicFilter: (items: { hostName: string }[]) => ({
      values: [
        ...Array.from(new Set(items.map((item) => item.hostName))) // at this point the list contains unique strings that can be used as ID
          .map(labelToFilterItem),
      ],
    }),
  };
};
