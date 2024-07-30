import { EnumValue } from '@kubev2v/common';

/**
 * This component enables filtering the VMware's virtual machines
 * by the hostname that they are running on.
 */
export const hostFilter = (t: (string) => string) => {
  return {
    type: 'host',
    primary: true,
    placeholderLabel: t('Host'),
    dynamicFilter: (items: { hostName: string }[]) => ({
      values: [
        ...Array.from(new Set(items.map((item) => item.hostName))) // at this point the list contains unique strings that can be used as ID
          .map((label: string): EnumValue => ({ id: label, label })),
      ],
    }),
  };
};
