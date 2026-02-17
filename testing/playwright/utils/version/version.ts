import { VERSION_ENV_VAR, VERSION_GATE_TAG } from './constants';
import type { SkippableTest, VersionTuple } from './types';

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

const getForkliftVersion = (): string | undefined =>
  process.env[VERSION_ENV_VAR]?.trim() ?? undefined;

const getForkliftVersionTuple = (): VersionTuple | null => {
  const versionString = getForkliftVersion();
  return versionString && !isLatest(versionString) ? parseVersion(versionString) : null;
};

const compareTuples = (a: VersionTuple, b: VersionTuple): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
};

/** True if the current Forklift version >= minimumVersion. Unset version returns false. */
export const isVersionAtLeast = (minimumVersion: VersionTuple | string): boolean => {
  const versionString = getForkliftVersion();
  if (!versionString) return false;
  if (isLatest(versionString)) return true;
  const currentVersion = getForkliftVersionTuple();
  if (!currentVersion) return false;
  const resolvedMinimum = resolveTuple(minimumVersion);
  if (!resolvedMinimum) return false;
  return compareTuples(currentVersion, resolvedMinimum) >= 0;
};

/**
 * True if the current version satisfies any of the per-stream minimums.
 * Useful for backported features where different minor streams have different minimum patches.
 *
 * Example: isVersionInStreams([V2_10_5, [2, 11, 1]]) means:
 *   - 2.10.5+ on the 2.10.x stream  -> true
 *   - 2.11.0                         -> false (below 2.11.1 minimum)
 *   - 2.11.1+                        -> true
 *   - 2.12.x+                        -> true (higher than any listed stream)
 */
export const isVersionInStreams = (streamMinimums: readonly (VersionTuple | string)[]): boolean => {
  const currentVersion = getForkliftVersionTuple();

  if (!currentVersion) {
    const versionString = getForkliftVersion();
    return versionString ? isLatest(versionString) : false;
  }

  const parsedMinimums = streamMinimums
    .map(resolveTuple)
    .filter((tuple): tuple is VersionTuple => tuple !== null);

  if (parsedMinimums.length === 0) return false;

  const matchingStreamMinimum = parsedMinimums.find(
    ([major, minor]) => currentVersion[0] === major && currentVersion[1] === minor,
  );

  if (matchingStreamMinimum) {
    return isVersionAtLeast(matchingStreamMinimum);
  }

  const highestStreamMinimum = parsedMinimums.reduce(
    (best, tuple) =>
      compareTuples([tuple[0], tuple[1], 0], [best[0], best[1], 0]) > 0 ? tuple : best,
    parsedMinimums[0],
  );

  return isVersionAtLeast(highestStreamMinimum);
};

// ---------------------------------------------------------------------------
// requireVersion — describe-level and test-level version gating
// ---------------------------------------------------------------------------

const formatVersion = (tuple: VersionTuple): string => tuple.join('.');

const buildSkipMessage = (version: VersionTuple | readonly VersionTuple[]): string => {
  const reason = Array.isArray(version[0])
    ? `Requires Forklift version in streams: ${(version as readonly VersionTuple[]).map(formatVersion).join(', ')}`
    : `Requires Forklift ${formatVersion(version as VersionTuple)}+`;
  return `${VERSION_GATE_TAG} ${reason}`;
};

const shouldSkip = (version: VersionTuple | readonly VersionTuple[]): boolean =>
  Array.isArray(version[0])
    ? !isVersionInStreams(version as readonly VersionTuple[])
    : !isVersionAtLeast(version as VersionTuple);

/**
 * Skip tests when the cluster version is below the minimum.
 * Works at both describe-level and inside a test body.
 *
 *   requireVersion(test, V2_11_0);
 *   requireVersion(test, [V2_10_5, V2_11_0]);  // multi-stream
 */
export const requireVersion = (
  testObj: SkippableTest,
  version: VersionTuple | readonly VersionTuple[],
): void => {
  testObj.skip(shouldSkip(version), buildSkipMessage(version));
};
