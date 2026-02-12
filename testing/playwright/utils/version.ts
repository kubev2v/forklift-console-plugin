/**
 * Forklift version from environment (e.g. FORKLIFT_VERSION=2.11.0).
 * Used to skip or gate tests that require a minimum Forklift version.
 *
 * The version is auto-detected from the cluster during global setup by reading
 * the MTV/Forklift ClusterServiceVersion (CSV). Set FORKLIFT_VERSION explicitly
 * in the environment to override auto-detection.
 *
 * FORKLIFT_VERSION=latest or LATEST means "always run" (all version checks pass).
 */
const VERSION_ENV_VAR = 'FORKLIFT_VERSION';

/**
 * Well-known Forklift version constants.
 * Use these instead of raw strings to avoid typos in version checks.
 */
export const V2_10_5 = '2.10.5';
export const V2_11_0 = '2.11.0';

type SemverTuple = [number, number, number];

const isLatest = (raw: string): boolean => raw.trim().toLowerCase() === 'latest';

const parseVersion = (raw: string): SemverTuple | null => {
  const normalized = raw.trim().replace(/^v/i, '');
  const parts = normalized.split('.').map((part) => parseInt(part, 10));
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

/**
 * True if the current Forklift version (from env) is >= minVersion.
 * If FORKLIFT_VERSION is not set, returns false so version-gated checks fail by default.
 *
 * @param minVersion - Minimum required version, e.g. V2_11_0
 */
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

/**
 * True if the current version (x.y.z) has the feature across multiple version streams.
 * For backported features: list the minimum version per stream that has it; any stream
 * newer than the highest listed is assumed to have it (e.g. fix in 2.11.1 implies 2.12.0+).
 * Only list streams that need an explicit minimum.
 *
 * @param minVersionByStream - e.g. [V2_10_5, '2.11.1'] → 2.10.6 ✓, 2.11.0 ✗, 2.11.2 ✓, 2.12.0 ✓
 */
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

/**
 * Minimal interface for the Playwright test object's skip method.
 * Works with `test` from @playwright/test and any fixture-extended test objects.
 */
type SkippableTest = { skip: (condition: boolean, description: string) => void };

/**
 * Skip all tests in the current describe block when Forklift version is below minVersion.
 * Generates the skip message automatically. Call at the top of a test.describe() block.
 *
 * @example
 * ```ts
 * import { requireVersion, V2_11_0 } from '../../../utils/version';
 *
 * test.describe('Feature X', () => {
 *   requireVersion(test, V2_11_0);
 *   // ...
 * });
 * ```
 *
 * @param testObj - The Playwright test object (base or fixture-extended)
 * @param minVersion - Minimum required version, e.g. V2_11_0
 */
export const requireVersion = (testObj: SkippableTest, minVersion: string): void => {
  testObj.skip(!isVersionAtLeast(minVersion), `Requires Forklift ${minVersion}+`);
};

/**
 * Skip all tests in the current describe block when the Forklift version doesn't satisfy
 * any of the listed stream minimums. For backported features where different version streams
 * have different minimum patch levels.
 *
 * @example
 * ```ts
 * import { requireVersionInStreams, V2_10_5 } from '../../../utils/version';
 *
 * test.describe('Backported feature', () => {
 *   requireVersionInStreams(test, [V2_10_5, '2.11.1']);
 *   // runs on 2.10.5+, 2.11.1+, 2.12.0+ — skipped on 2.11.0, 2.10.4, etc.
 * });
 * ```
 *
 * @param testObj - The Playwright test object (base or fixture-extended)
 * @param minVersionByStream - Minimum version per stream, e.g. [V2_10_5, '2.11.1']
 */
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

/**
 * Step-level gating: run a block only when version >= minVersion. Use inside a test when only
 * some steps depend on a newer Forklift version. Keeps one test that adapts instead of
 * duplicating tests. Prefer requireVersion when the entire describe only applies to a
 * minimum version.
 *
 * @param minVersion - Minimum required version, e.g. V2_11_0
 * @param fn - Code to run when version is satisfied (e.g. new UI flow or assertion)
 * @returns Promise that resolves when the block ran or was skipped
 */
export const runStepIfVersion = async <T>(
  minVersion: string,
  fn: () => Promise<T>,
): Promise<T | undefined> => (isVersionAtLeast(minVersion) ? fn() : undefined);
