import type { FC } from 'react';

import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import type { FeatureName } from '@utils/types';

type FeatureGateProps = {
  /** Feature flag name to check (e.g., 'feature_copy_offload') */
  featureName: FeatureName;
  /** Optional namespace to check in; falls back to active namespace */
  namespace?: string;
  /** Children to render when the feature is enabled */
  children: React.ReactNode;
};

/**
 * Conditionally renders children if the given ForkliftController feature flag is enabled.
 */
export const FeatureGate: FC<FeatureGateProps> = ({ children, featureName, namespace }) => {
  const { isFeatureEnabled } = useFeatureFlags(namespace);

  return isFeatureEnabled(featureName) ? children : null;
};
