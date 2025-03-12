import { PlanData } from 'src/modules/Plans/utils';

import { ResourceField } from '@forklift/common/utils/types';

export type CellProps = {
  data: PlanData;
  fieldId: string;
  fields: ResourceField[];
};
