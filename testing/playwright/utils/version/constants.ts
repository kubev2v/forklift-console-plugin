import type { VersionTuple } from './types';

/** Environment variable name for the Forklift version. Auto-detected from the cluster CSV; set explicitly to override. */
export const VERSION_ENV_VAR = 'FORKLIFT_VERSION';

/** Marker checked by check-version-gating.sh to distinguish version skips from other skips. */
export const VERSION_GATE_TAG = '[version-gated]';

/** Pre-parsed version constants — avoids repeated string parsing. */
export const V2_10_5: VersionTuple = [2, 10, 5];
export const V2_11_0: VersionTuple = [2, 11, 0];
