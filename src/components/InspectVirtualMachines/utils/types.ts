import type { InspectionStatus } from '@utils/crds/conversion/constants';
import type { ObjectReference, V1beta1Conversion } from '@utils/crds/conversion/types';

export type DiskEncryptionParam = {
  secret?: ObjectReference;
  type: 'Clevis' | 'LUKS';
};

export type InspectionCreateResult = {
  failed: { error: unknown; vmId: string }[];
  succeeded: V1beta1Conversion[];
};

export type InspectionVmRowData = {
  diskEncryptionLabel?: string;
  id: string;
  inspectionStatus: InspectionStatus;
  isActive: boolean;
  name: string;
  timestamp?: string;
};

export type VmInspectionRef = {
  diskEncryption?: DiskEncryptionParam;
  id: string;
  name: string;
};

export type VmOverrides = {
  nbdeClevis?: boolean;
  passphrases?: string[];
};

export type CreateInspectionsFn = (vms: VmInspectionRef[]) => Promise<InspectionCreateResult>;
