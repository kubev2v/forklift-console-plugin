import type { ResourceField } from '@components/common/utils/types';
import type { ProviderVirtualMachine } from '@kubev2v/types';

export type VmData = {
  vm: ProviderVirtualMachine;
  name: string;
  namespace: string;
  isProviderLocalOpenshift?: boolean;
  folderName?: string;
  hostName?: string;
};

export type VMCellProps = {
  data: VmData;
  fieldId: string;
  fields: ResourceField[];
};
