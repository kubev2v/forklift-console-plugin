import { ResourceField } from '@kubev2v/common';

import { VMData } from '../types';

export interface PlanVMsCellProps {
  data: VMData;
  fieldId: string;
  fields: ResourceField[];
}
