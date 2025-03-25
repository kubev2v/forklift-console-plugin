import { ResourceField } from '@components/common/utils/types';

import { VMData } from '../types';

export type PlanVMsCellProps = {
  data: VMData;
  fieldId?: string;
  fields?: ResourceField[];
};
