import { PlanData } from 'src/modules/Plans/utils/types/PlanData';

import { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: PlanData;
  fieldId: string;
  fields: ResourceField[];
};
