import { ResourceField } from '@kubev2v/common';

import { PlanData, VMData } from '../types';

export interface PlanVMsCellProps {
  data: VMData;
  fieldId: string;
  fields: ResourceField[];
  planData: PlanData;
}
