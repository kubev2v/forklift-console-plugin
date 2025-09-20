import type { EnumValue } from '@components/common/utils/types';
import { t } from '@utils/i18n';

import { CustomFilterType } from '../../constants';

const labelToFilterItem = (label: string): EnumValue =>
  label ? { id: label, label } : { id: label, label: 'Undefined' };

/**
 * This component enables filtering the oVirt virtual machines
 * by the hostname that they are running on.
 */
export const ovirtHostFilter = () => {
  return {
    dynamicFilter: (items: { vm: { host: string } }[]) => ({
      values: [
        ...Array.from(new Set(items.map((item) => item.vm.host))) // at this point the list contains unique strings that can be used as ID
          .map(labelToFilterItem),
      ],
    }),
    placeholderLabel: t('Host'),
    primary: true,
    type: CustomFilterType.Host,
  };
};
