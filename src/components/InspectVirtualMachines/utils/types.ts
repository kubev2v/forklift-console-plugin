import type { V1beta1Conversion } from '@utils/crds/conversion/types';

export type InspectionCreateResult = {
  failed: { error: unknown; vmId: string }[];
  succeeded: V1beta1Conversion[];
};
