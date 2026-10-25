import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import type { useCopyAppliancePlacementOptions } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementOptions';

export type CreateProviderPlacement = {
  canDeploy: boolean;
  connection: {
    error: Error | null;
    isMissing: boolean;
    isReady: boolean;
    loaded: boolean;
    phase: string | undefined;
  };
  onChange: (field: CopyApplianceSettingField, value: string) => void;
  options: ReturnType<typeof useCopyAppliancePlacementOptions>;
  values: CopyAppliancePlacementValues;
};
