import { ResourceField } from '@forklift/common/utils/types';

import { VMData } from '../types';

export type PlanVMsCellProps = {
  data: VMData;
  fieldId?: string;
  fields?: ResourceField[];
};
