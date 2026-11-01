import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';

import type { Reporter, TestCase, TestError, TestResult } from '@playwright/test/reporter';

import {
  buildFailureDigest,
  buildTimings,
  renderAnnotations,
  renderMarkdown,
  type TestAttempt,
  toOutcome,
} from './failureDigest';

const OUTPUT_DIR = 'test-results';
const PROJECT_LEVEL_TITLES = 2;

const outcomeTitle = (test: TestCase): string =>
  test
    .titlePath()
    .filter((part) => Boolean(part))
    .slice(-PROJECT_LEVEL_TITLES)
    .join(' › ');

/**
 * Writes one compact, agent-readable digest per run:
 *   test-results/failures.md   — what failed, where, at which step, with artifacts
 *   test-results/failures.json — same data for scripts
 *   test-results/timings.json  — every test duration, slowest first
 * Also emits GitHub `::error` annotations and appends to $GITHUB_STEP_SUMMARY.
 */
class FailureDigestReporter implements Reporter {
  private readonly attemptsByTest = new Map<string, TestAttempt[]>();

  onEnd(): void {
    const attempts = [...this.attemptsByTest.values()];
    const digest = buildFailureDigest(attempts);
    const markdown = renderMarkdown(digest);

    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(`${OUTPUT_DIR}/failures.md`, markdown);
    writeFileSync(`${OUTPUT_DIR}/failures.json`, `${JSON.stringify(digest, null, 2)}\n`);
    writeFileSync(
      `${OUTPUT_DIR}/timings.json`,
      `${JSON.stringify(buildTimings(attempts), null, 2)}\n`,
    );

    const annotations = renderAnnotations(digest);
    if (annotations) {
      process.stdout.write(`${annotations}\n`);
    }

    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryPath) {
      appendFileSync(summaryPath, markdown);
    }
  }

  /* eslint-disable @typescript-eslint/class-methods-use-this -- Playwright calls these reporter hooks. */

  onError(error: TestError): void {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    const text = [error.message ?? '', error.stack ?? ''].join('\n').trim();
    writeFileSync(`${OUTPUT_DIR}/global-error.txt`, `${text}\n`);
    process.stdout.write(
      `::error title=Playwright global error::${error.message ?? 'run failed'}\n`,
    );
  }

  /* eslint-enable @typescript-eslint/class-methods-use-this */

  onTestEnd(test: TestCase, result: TestResult): void {
    const attempts = this.attemptsByTest.get(test.id) ?? [];
    const outcome = toOutcome(result, test.location, outcomeTitle(test));
    // Playwright attaches the trace only to the retry that recorded it, so keep every
    // attempt's artifacts in the digest — the last attempt is often the one without a trace.
    const previous = attempts[attempts.length - 1]?.outcome.attachments ?? [];
    outcome.attachments = [...new Set([...previous, ...outcome.attachments])];
    attempts.push({ outcome, passed: result.status === 'passed' });
    this.attemptsByTest.set(test.id, attempts);
  }

  /* eslint-disable-next-line @typescript-eslint/class-methods-use-this -- Playwright reporter hook. */
  printsToStdio(): boolean {
    return false;
  }
}

export default FailureDigestReporter;
