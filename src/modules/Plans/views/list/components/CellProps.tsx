import type { PlanData } from 'src/modules/Plans/utils';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: PlanData;
  fieldId: string;
  fields: ResourceField[];
};
