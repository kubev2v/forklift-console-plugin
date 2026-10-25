import type { UseFormSetValue } from 'react-hook-form';
import type { VddkSetupMode } from 'src/providers/utils/constants';

import type { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import type { V1beta1CopyApplianceTemplate, V1beta1Provider } from '@forklift-ui/types';

import type { CopyAppliancePlacementValues } from '../DetailsSection/copyAppliancePlacementConfig';
import type { useCopyAppliancePlacementOptions } from '../DetailsSection/useCopyAppliancePlacementOptions';

export type DiskTransferValues = {
  aioEnabled: boolean;
  method: VddkSetupMode;
  placement: CopyAppliancePlacementValues;
  vddkImage: string;
};

export type CopyApplianceDisplayStatus = 'configured' | 'pending' | 'unavailable';

export type DiskTransferFormValues = DiskTransferValues & { confirmedDeletion: boolean };

export type EditDiskTransferProps = {
  provider: V1beta1Provider;
  template?: V1beta1CopyApplianceTemplate;
  templateLookupUnavailable: boolean;
};

export type EditDiskTransferState = {
  canSubmit: boolean;
  copyApplianceEnabled: boolean;
  imageError?: string;
  isAppliance: boolean;
  onConfirm: () => Promise<void>;
  onMethodChange: (method: VddkSetupMode) => void;
  permissionError?: string;
  placementOptions: ReturnType<typeof useCopyAppliancePlacementOptions>;
  requiresDeletion: boolean;
  setValue: UseFormSetValue<DiskTransferFormValues>;
  templateError?: string;
  values: DiskTransferFormValues;
};

export type DiskTransferPatch =
  | { op: typeof ADD | typeof REPLACE; path: string; value: Record<string, string> | string }
  | { op: typeof REMOVE; path: string };

export type DiskTransferSaveError = Error & { templateDeleted: boolean };
