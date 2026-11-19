import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import type { useCopyAppliancePlacementOptions } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementOptions';

import type { V1beta1Provider } from '@forklift-ui/types';
import type { ProviderStatus } from '@utils/types';

export type CreateProviderPlacement = {
  canDeploy: boolean;
  connection: {
    error: Error | null;
    isMissing: boolean;
    isReady: boolean;
    loaded: boolean;
    phase: ProviderStatus | undefined;
    provider: V1beta1Provider | undefined;
  };
  onChange: (field: CopyApplianceSettingField, value: string) => void;
  options: ReturnType<typeof useCopyAppliancePlacementOptions>;
  values: CopyAppliancePlacementValues;
};
