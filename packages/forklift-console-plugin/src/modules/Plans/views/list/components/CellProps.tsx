import { PlanData } from 'src/modules/Plans/utils';

import { ResourceField } from '@kubev2v/common';

export type CellProps = {
  data: PlanData;
  fieldId: string;
  fields: ResourceField[];
};
