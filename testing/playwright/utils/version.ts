/** Auto-detected from the cluster CSV; set explicitly to override. "latest" means all checks pass. */
const VERSION_ENV_VAR = 'FORKLIFT_VERSION';

export const V2_10_5 = '2.10.5';
export const V2_11_0 = '2.11.0';

type SemverTuple = [number, number, number];

const isLatest = (raw: string): boolean => raw.trim().toLowerCase() === 'latest';

const parseVersion = (raw: string): SemverTuple | null => {
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

const getForkliftVersion = (): string | undefined => {
  const raw = process.env[VERSION_ENV_VAR]?.trim() ?? undefined;
  return raw;
};

const getForkliftVersionTuple = (): SemverTuple | null => {
  const raw = getForkliftVersion();
  return raw && !isLatest(raw) ? parseVersion(raw) : null;
};

const compareTuples = (a: SemverTuple, b: SemverTuple): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
};

/** True if the current Forklift version >= minVersion. Unset version → false. */
export const isVersionAtLeast = (minVersion: string): boolean => {
  const raw = getForkliftVersion();
  if (!raw) return false;
  if (isLatest(raw)) return true;
  const current = getForkliftVersionTuple();
  if (!current) return false;
  const min = parseVersion(minVersion);
  if (!min) return false;
  return compareTuples(current, min) >= 0;
};

/** True if the current version satisfies any of the per-stream minimums (for backported features). */
export const isVersionInStreams = (minVersionByStream: readonly string[]): boolean => {
  const raw = getForkliftVersion();
  if (!raw) return false;
  if (isLatest(raw)) return true;
  const current = getForkliftVersionTuple();
  if (!current) return false;
  const [currMajor, currMinor, currPatch] = current;
  const parsed = minVersionByStream.map(parseVersion).filter((t): t is SemverTuple => t !== null);
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

/** Minimal interface for Playwright's test.skip(). */
type SkippableTest = { skip: (condition: boolean, description: string) => void };

/** Skip the current describe block when Forklift version < minVersion. */
export const requireVersion = (testObj: SkippableTest, minVersion: string): void => {
  testObj.skip(!isVersionAtLeast(minVersion), `Requires Forklift ${minVersion}+`);
};

/** Skip the current describe block when the version doesn't satisfy any stream minimum. */
export const requireVersionInStreams = (
  testObj: SkippableTest,
  minVersionByStream: readonly string[],
): void => {
  const streams = minVersionByStream.join(', ');
  testObj.skip(
    !isVersionInStreams(minVersionByStream),
    `Requires Forklift version in streams: ${streams}`,
  );
};

/** Run a block only when version >= minVersion (step-level gating within a single test). */
export const runStepIfVersion = async <T>(
  minVersion: string,
  fn: () => Promise<T>,
): Promise<T | undefined> => (isVersionAtLeast(minVersion) ? fn() : undefined);
