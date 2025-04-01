import { ResourceField } from '@components/common/utils/types';

import { VMData } from '../types/VMData';

export type PlanVMsCellProps = {
  data: VMData;
  fieldId?: string;
  fields?: ResourceField[];
};
