import type { TestResult } from '@playwright/test/reporter';

import {
  buildFailureDigest,
  buildTimings,
  renderAnnotations,
  renderMarkdown,
  type TestAttempt,
  type TestOutcome,
  toOutcome,
  toRepoPath,
} from '../failureDigest';

const FILE = '/repo/testing/playwright/e2e/upstream/plan-table-layout.spec.ts';

const outcome = (overrides: Partial<TestOutcome> = {}): TestOutcome => ({
  attachments: [],
  durationMs: 1000,
  error: '',
  failingStep: '',
  file: 'testing/playwright/e2e/upstream/plan-table-layout.spec.ts',
  line: 12,
  retries: 0,
  status: 'passed',
  title: 'Plans: default widths',
  ...overrides,
});

const attempt = (overrides: Partial<TestOutcome>, passed: boolean): TestAttempt => ({
  outcome: outcome({ retries: passed ? 1 : 0, ...overrides }),
  passed,
});

const resultOf = (overrides: Partial<TestResult> = {}): TestResult =>
  ({
    attachments: [],
    duration: 2500,
    error: undefined,
    retry: 0,
    status: 'failed',
    steps: [],
    ...overrides,
  }) as unknown as TestResult;

describe('failureDigest', () => {
  it('normalises repo-relative paths', () => {
    expect(toRepoPath(FILE)).toBe('testing/playwright/e2e/upstream/plan-table-layout.spec.ts');
    expect(toRepoPath('/elsewhere/spec.ts')).toBe('/elsewhere/spec.ts');
  });

  it('keeps the last failure when every attempt failed', () => {
    const digest = buildFailureDigest([
      [
        attempt({ error: 'first timeout', status: 'failed' }, false),
        attempt({ error: 'second timeout', retries: 1, status: 'failed' }, false),
      ],
    ]);

    expect(digest.flaky).toHaveLength(0);
    expect(digest.failed).toHaveLength(1);
    expect(digest.failed[0].error).toBe('second timeout');
    expect(digest.totals).toEqual({ failed: 1, flaky: 0, passed: 0, skipped: 0, total: 1 });
  });

  it('reports a flake with the first failure reason and the passing status', () => {
    const digest = buildFailureDigest([
      [
        attempt({ error: 'flaky timeout', failingStep: 'Open menu', status: 'timedOut' }, false),
        attempt({ retries: 1, status: 'passed' }, true),
      ],
    ]);

    expect(digest.failed).toHaveLength(0);
    expect(digest.flaky).toHaveLength(1);
    expect(digest.flaky[0]).toMatchObject({
      error: 'flaky timeout',
      failingStep: 'Open menu',
      status: 'passed',
    });
    expect(digest.totals).toEqual({ failed: 0, flaky: 1, passed: 1, skipped: 0, total: 1 });
  });

  it('counts skipped tests without listing them as failures', () => {
    const digest = buildFailureDigest([[attempt({ status: 'skipped' }, false)]]);

    expect(digest.failed).toHaveLength(0);
    expect(digest.totals).toEqual({ failed: 0, flaky: 0, passed: 0, skipped: 1, total: 1 });
  });

  it('surfaces the attempt number of the reported outcome', () => {
    const digest = buildFailureDigest([
      [
        attempt({ error: 'first', status: 'failed' }, false),
        attempt({ error: 'last', retries: 2, status: 'failed' }, false),
      ],
    ]);

    expect(renderMarkdown(digest)).toContain('Status: failed (attempt 3)');
    expect(renderMarkdown(digest)).toContain('last');
    expect(renderMarkdown(digest)).not.toContain('first');
  });

  it('renders a clean digest when nothing failed', () => {
    const markdown = renderMarkdown(buildFailureDigest([[attempt({}, true)]]));

    expect(markdown).toContain('No failures or flaky tests.');
  });

  it('escapes workflow command payloads in annotations', () => {
    const annotations = renderAnnotations(
      buildFailureDigest([
        [
          attempt(
            {
              error: 'trace exploded',
              failingStep: 'Click\nwith, commas',
              status: 'failed',
              title: '100% ::error:: injected',
            },
            false,
          ),
        ],
      ]),
    );

    expect(annotations.startsWith('::error file=testing/')).toBe(true);
    expect(annotations).toContain('title=100%25 ::error:: injected');
    expect(annotations).toContain('Click with, commas');
    expect(annotations.split('\n')).toHaveLength(1);
  });

  it('orders timings by duration', () => {
    const timings = buildTimings([
      [attempt({ durationMs: 10, title: 'short' }, true)],
      [attempt({ durationMs: 90, title: 'long' }, false)],
    ]);

    expect(timings.map((entry) => entry.title)).toEqual(['long', 'short']);
  });

  it('derives an outcome from a Playwright result', () => {
    const parsed = toOutcome(
      resultOf({
        attachments: [{ contentType: 'application/zip', name: 'trace', path: `${FILE}-trace.zip` }],
        error: { message: 'boom', value: 'boom' },
        retry: 2,
      }),
      { file: FILE, line: 12 },
      'Plans: default widths',
    );

    expect(parsed).toMatchObject({
      attachments: ['testing/playwright/e2e/upstream/plan-table-layout.spec.ts-trace.zip'],
      error: 'boom',
      file: 'testing/playwright/e2e/upstream/plan-table-layout.spec.ts',
      retries: 2,
      status: 'failed',
      title: 'Plans: default widths',
    });
  });
});
