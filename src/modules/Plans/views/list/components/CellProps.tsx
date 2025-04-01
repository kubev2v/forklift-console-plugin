import type { PlanData } from 'src/modules/Plans/utils/types/PlanData';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: PlanData;
  fieldId: string;
  fields: ResourceField[];
};
