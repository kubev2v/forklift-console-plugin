import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import type { EnumValue } from '@components/common/utils/types';
import { getCategoryLabel } from '@components/Concerns/utils/category';

export const createInitialUniqueMaps = () => ({
  critical: new Map<string, EnumValue>(),
  information: new Map<string, EnumValue>(),
  warning: new Map<string, EnumValue>(),
});

type UniqueMaps = ReturnType<typeof createInitialUniqueMaps>;

export const getUniqueMapByCategory = (acc: UniqueMaps, category: string) => {
  const label = getCategoryLabel(category);
  if (label === ConcernCategory.Critical) return acc.critical;
  if (label === ConcernCategory.Warning) return acc.warning;
  return acc.information;
};
