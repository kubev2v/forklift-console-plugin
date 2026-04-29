import type { VersionTuple } from './types';

/** Environment variable name for the Forklift version. Auto-detected from the cluster CSV; set explicitly to override. */
export const VERSION_ENV_VAR = 'FORKLIFT_VERSION';

/** Environment variable name for the CNV (OpenShift Virtualization) version. Auto-detected from the cluster CSV; set explicitly to override. */
export const CNV_VERSION_ENV_VAR = 'CNV_VERSION';

/** Marker checked by check-version-gating.sh to distinguish version skips from other skips. */
export const VERSION_GATE_TAG = '[version-gated]';

/** Marker for CNV version-gated skips — distinct from VERSION_GATE_TAG so check-version-gating.sh does not flag these. */
export const CNV_VERSION_GATE_TAG = '[cnv-version-gated]';

/** Pre-parsed Forklift version constants — avoids repeated string parsing. */
export const V2_10_5: VersionTuple = [2, 10, 5];
export const V2_11_0: VersionTuple = [2, 11, 0];
export const V2_11_3: VersionTuple = [2, 11, 3];
export const V2_12_0: VersionTuple = [2, 12, 0];

/** Pre-parsed CNV (OpenShift Virtualization) version constants. */
export const CNV_4_17_0: VersionTuple = [4, 17, 0];
export const CNV_4_18_0: VersionTuple = [4, 18, 0];
export const CNV_4_21_0: VersionTuple = [4, 21, 0];
