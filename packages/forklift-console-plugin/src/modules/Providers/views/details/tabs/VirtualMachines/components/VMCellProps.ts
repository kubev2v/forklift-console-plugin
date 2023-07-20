import { ResourceField } from '@kubev2v/common';

import { VmData } from '../ProviderVirtualMachinesRow';

export interface VMCellProps {
  data: VmData;
  fieldId: string;
  fields: ResourceField[];
}
