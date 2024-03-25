import { ResourceField } from '@kubev2v/common';
import { ProviderVirtualMachine } from '@kubev2v/types';

export interface VmData {
  vm: ProviderVirtualMachine;
  name: string;
  namespace: string;
  isProviderLocalOpenshift?: boolean;
}

export interface VMCellProps {
  data: VmData;
  fieldId: string;
  fields: ResourceField[];
}
