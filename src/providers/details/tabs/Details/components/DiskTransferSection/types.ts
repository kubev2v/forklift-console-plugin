import type { VddkSetupMode } from 'src/providers/utils/constants';

import type { CopyAppliancePlacementValues } from '../DetailsSection/copyAppliancePlacementConfig';

export type DiskTransferValues = {
  aioEnabled: boolean;
  method: VddkSetupMode;
  placement: CopyAppliancePlacementValues;
  vddkImage: string;
};

export type CopyApplianceDisplayStatus = 'configured' | 'pending' | 'unavailable';
