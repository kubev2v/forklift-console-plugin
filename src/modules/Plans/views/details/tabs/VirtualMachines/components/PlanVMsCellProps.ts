import type { ResourceField } from '@components/common/utils/types';

import type { VMData } from '../types/VMData';

export type PlanVMsCellProps = {
  data: VMData;
  fieldId?: string;
  fields?: ResourceField[];
};
