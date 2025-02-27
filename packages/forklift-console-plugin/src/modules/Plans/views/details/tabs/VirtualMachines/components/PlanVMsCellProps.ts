import { ResourceField } from '@kubev2v/common';

import { VMData } from '../types';

export type PlanVMsCellProps = {
  data: VMData;
  fieldId?: string;
  fields?: ResourceField[];
};
