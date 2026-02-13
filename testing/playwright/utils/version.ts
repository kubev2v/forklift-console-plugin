/** Auto-detected from the cluster CSV; set explicitly to override. "latest" means all checks pass. */
const VERSION_ENV_VAR = 'FORKLIFT_VERSION';

export type VersionTuple = [number, number, number];

/** Pre-parsed version constants — avoids repeated string parsing on the hot path. */
export const V2_10_5: VersionTuple = [2, 10, 5];
export const V2_11_0: VersionTuple = [2, 11, 0];

const isLatest = (raw: string): boolean => raw.trim().toLowerCase() === 'latest';

const parseVersion = (raw: string): VersionTuple | null => {
  const normalized = raw.trim().replace(/^v/i, '');
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

const getForkliftVersion = (): string | undefined => {
  const raw = process.env[VERSION_ENV_VAR]?.trim() ?? undefined;
  return raw;
};

const getForkliftVersionTuple = (): VersionTuple | null => {
  const raw = getForkliftVersion();
  return raw && !isLatest(raw) ? parseVersion(raw) : null;
};

const compareTuples = (a: VersionTuple, b: VersionTuple): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
};

/** True if the current Forklift version >= minVersion. Unset version → false. */
export const isVersionAtLeast = (minVersion: VersionTuple | string): boolean => {
  const raw = getForkliftVersion();
  if (!raw) return false;
  if (isLatest(raw)) return true;
  const current = getForkliftVersionTuple();
  if (!current) return false;
  const min = resolveTuple(minVersion);
  if (!min) return false;
  return compareTuples(current, min) >= 0;
};

/** True if the current version satisfies any of the per-stream minimums (for backported features). */
export const isVersionInStreams = (
  minVersionByStream: readonly (VersionTuple | string)[],
): boolean => {
  const raw = getForkliftVersion();
  if (!raw) return false;
  if (isLatest(raw)) return true;
  const current = getForkliftVersionTuple();
  if (!current) return false;
  const [currMajor, currMinor, currPatch] = current;
  const parsed = minVersionByStream.map(resolveTuple).filter((t): t is VersionTuple => t !== null);
  if (parsed.length === 0) return false;
  const maxStream = parsed.reduce(
    (best, tuple) =>
      compareTuples([tuple[0], tuple[1], 0], [best[0], best[1], 0]) > 0 ? tuple : best,
    parsed[0],
  );
  const [maxMajor, maxMinor] = maxStream;
  if (currMajor > maxMajor || (currMajor === maxMajor && currMinor > maxMinor)) return true;
  const minForStream = parsed.find(([major, minor]) => currMajor === major && currMinor === minor);
  if (!minForStream) return false;
  return currPatch >= minForStream[2];
};

// ---------------------------------------------------------------------------
// requireVersion — describe-level and test-level version gating
// ---------------------------------------------------------------------------

type SkippableTest = {
  skip: (condition: boolean, description: string) => void;
};

const formatVersion = (tuple: VersionTuple): string => tuple.join('.');

const buildSkipMessage = (version: VersionTuple | readonly VersionTuple[]): string =>
  Array.isArray(version[0])
    ? `Requires Forklift version in streams: ${(version as readonly VersionTuple[]).map(formatVersion).join(', ')}`
    : `Requires Forklift ${formatVersion(version as VersionTuple)}+`;

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
