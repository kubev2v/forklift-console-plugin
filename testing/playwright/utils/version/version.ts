import {
  CNV_VERSION_ENV_VAR,
  CNV_VERSION_GATE_TAG,
  VERSION_ENV_VAR,
  VERSION_GATE_TAG,
} from './constants';
import type { SkippableTest, VersionTuple } from './types';

// ---------------------------------------------------------------------------
// Generic version parsing and comparison
// ---------------------------------------------------------------------------

const isLatest = (versionString: string): boolean =>
  versionString.trim().toLowerCase() === 'latest';

const parseVersion = (versionString: string): VersionTuple | null => {
  const normalized = versionString.trim().replace(/^v/i, '');
  const parts = normalized.split('.').map((part) => Number.parseInt(part, 10));
  if (parts.length < 2 || parts.some(Number.isNaN)) {
    return null;
  }
  const major = parts[0] ?? 0;
  const minor = parts[1] ?? 0;
  const patch = parts[2] ?? 0;
  return [major, minor, patch];
};

const resolveTuple = (version: VersionTuple | string): VersionTuple | null =>
  Array.isArray(version) ? version : parseVersion(version);

const compareTuples = (a: VersionTuple, b: VersionTuple): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
};

const formatVersion = (tuple: VersionTuple): string => tuple.join('.');

// ---------------------------------------------------------------------------
// Generic helpers parameterized by env var
// ---------------------------------------------------------------------------

const getVersionString = (envVar: string): string | undefined =>
  process.env[envVar]?.trim() ?? undefined;

const getVersionTuple = (envVar: string): VersionTuple | null => {
  const versionString = getVersionString(envVar);
  return versionString && !isLatest(versionString) ? parseVersion(versionString) : null;
};

/**
 * Check if the version from `envVar` is >= `minimumVersion`.
 *
 * @param whenUnset - value to return when the env var is unset.
 *   Forklift uses `false` (unset = skip), CNV uses `true` (unset = run).
 */
const versionAtLeast = (
  envVar: string,
  minimumVersion: VersionTuple | string,
  whenUnset: boolean,
): boolean => {
  const versionString = getVersionString(envVar);
  if (!versionString) return whenUnset;
  if (isLatest(versionString)) return true;
  const currentVersion = getVersionTuple(envVar);
  if (!currentVersion) return false;
  const resolvedMinimum = resolveTuple(minimumVersion);
  if (!resolvedMinimum) return false;
  return compareTuples(currentVersion, resolvedMinimum) >= 0;
};

/**
 * Check if the version from `envVar` satisfies any of the per-stream minimums.
 *
 * @param whenUnset - value to return when the env var is unset.
 */
const versionInStreams = (
  envVar: string,
  streamMinimums: readonly (VersionTuple | string)[],
  whenUnset: boolean,
): boolean => {
  const currentVersion = getVersionTuple(envVar);

  if (!currentVersion) {
    const versionString = getVersionString(envVar);
    if (!versionString) return whenUnset;
    return isLatest(versionString);
  }

  const parsedMinimums = streamMinimums
    .map(resolveTuple)
    .filter((tuple): tuple is VersionTuple => tuple !== null);

  if (parsedMinimums.length === 0) return false;

  const matchingStreamMinimum = parsedMinimums.find(
    ([major, minor]) => currentVersion[0] === major && currentVersion[1] === minor,
  );

  if (matchingStreamMinimum) {
    return versionAtLeast(envVar, matchingStreamMinimum, whenUnset);
  }

  const highestStreamMinimum = parsedMinimums.reduce(
    (best, tuple) =>
      compareTuples([tuple[0], tuple[1], 0], [best[0], best[1], 0]) > 0 ? tuple : best,
    parsedMinimums[0],
  );

  return versionAtLeast(envVar, highestStreamMinimum, whenUnset);
};

// ---------------------------------------------------------------------------
// Forklift (MTV) version gating — unset version → skip (mandatory gating)
// ---------------------------------------------------------------------------

/** True if the current Forklift version >= minimumVersion. Unset version returns false. */
export const isVersionAtLeast = (minimumVersion: VersionTuple | string): boolean =>
  versionAtLeast(VERSION_ENV_VAR, minimumVersion, false);

/**
 * True if the current Forklift version satisfies any of the per-stream minimums.
 *
 * Example: isVersionInStreams([V2_10_5, [2, 11, 1]]) means:
 *   - 2.10.5+ on the 2.10.x stream  -> true
 *   - 2.11.0                         -> false (below 2.11.1 minimum)
 *   - 2.11.1+                        -> true
 *   - 2.12.x+                        -> true (higher than any listed stream)
 */
export const isVersionInStreams = (streamMinimums: readonly (VersionTuple | string)[]): boolean =>
  versionInStreams(VERSION_ENV_VAR, streamMinimums, false);

const buildForkliftSkipMessage = (version: VersionTuple | readonly VersionTuple[]): string => {
  const reason = Array.isArray(version[0])
    ? `Requires Forklift version in streams: ${(version as readonly VersionTuple[]).map(formatVersion).join(', ')}`
    : `Requires Forklift ${formatVersion(version as VersionTuple)}+`;
  return `${VERSION_GATE_TAG} ${reason}`;
};

const shouldSkipForklift = (version: VersionTuple | readonly VersionTuple[]): boolean =>
  Array.isArray(version[0])
    ? !isVersionInStreams(version as readonly VersionTuple[])
    : !isVersionAtLeast(version as VersionTuple);

/**
 * Skip tests when the cluster Forklift version is below the minimum.
 * Works at both describe-level and inside a test body.
 *
 *   requireVersion(test, V2_11_0);
 *   requireVersion(test, [V2_10_5, V2_11_0]);  // multi-stream
 */
export const requireVersion = (
  testObj: SkippableTest,
  version: VersionTuple | readonly VersionTuple[],
): void => {
  testObj.skip(shouldSkipForklift(version), buildForkliftSkipMessage(version));
};

// ---------------------------------------------------------------------------
// CNV (OpenShift Virtualization) version gating — unset version → run (optional gating)
// ---------------------------------------------------------------------------

/** True if the current CNV version >= minimumVersion. Unset version returns true (tests run by default). */
export const isCNVVersionAtLeast = (minimumVersion: VersionTuple | string): boolean =>
  versionAtLeast(CNV_VERSION_ENV_VAR, minimumVersion, true);

/**
 * True if the current CNV version satisfies any of the per-stream minimums.
 * Unset version returns true (tests run by default).
 */
export const isCNVVersionInStreams = (
  streamMinimums: readonly (VersionTuple | string)[],
): boolean => versionInStreams(CNV_VERSION_ENV_VAR, streamMinimums, true);

const buildCNVSkipMessage = (version: VersionTuple | readonly VersionTuple[]): string => {
  const reason = Array.isArray(version[0])
    ? `Requires CNV version in streams: ${(version as readonly VersionTuple[]).map(formatVersion).join(', ')}`
    : `Requires CNV ${formatVersion(version as VersionTuple)}+`;
  return `${CNV_VERSION_GATE_TAG} ${reason}`;
};

const shouldSkipCNV = (version: VersionTuple | readonly VersionTuple[]): boolean =>
  Array.isArray(version[0])
    ? !isCNVVersionInStreams(version as readonly VersionTuple[])
    : !isCNVVersionAtLeast(version as VersionTuple);

/**
 * Skip tests when the cluster CNV version is below the minimum.
 * Unlike requireVersion, this is optional — tests run when CNV version is unknown.
 * Works at both describe-level and inside a test body.
 *
 *   requireCNVVersion(test, CNV_4_18_0);
 *   requireCNVVersion(test, [CNV_4_17_0, CNV_4_18_0]);  // multi-stream
 */
export const requireCNVVersion = (
  testObj: SkippableTest,
  version: VersionTuple | readonly VersionTuple[],
): void => {
  testObj.skip(shouldSkipCNV(version), buildCNVSkipMessage(version));
};
