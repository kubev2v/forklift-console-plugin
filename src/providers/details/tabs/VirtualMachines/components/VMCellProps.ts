import type { ProviderVmData } from 'src/utils/types';

import type { ResourceField } from '@components/common/utils/types';

export type VmData = ProviderVmData;

export type VMCellProps = {
  data: VmData;
  fieldId: string;
  fields: ResourceField[];
};
