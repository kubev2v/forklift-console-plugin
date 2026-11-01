import { stripVTControlCharacters } from 'node:util';

import type { TestError, TestResult, TestStep } from '@playwright/test/reporter';

const ANNOTATION_MESSAGE_MAX_CHARS = 400;
const MAX_ERROR_CHARS = 1500;
const REPO_PATH_MARKER = 'testing/';

export type TestOutcome = {
  attachments: string[];
  durationMs: number;
  error: string;
  failingStep: string;
  file: string;
  line: number;
  retries: number;
  status: string;
  title: string;
};

export type TestAttempt = {
  outcome: TestOutcome;
  passed: boolean;
};

export type FailureDigest = {
  failed: TestOutcome[];
  flaky: TestOutcome[];
  generatedAt: string;
  totals: { failed: number; flaky: number; passed: number; skipped: number; total: number };
};

export type TimingEntry = {
  durationMs: number;
  file: string;
  line: number;
  status: string;
  title: string;
};

export type TestLocation = { file: string; line: number };

/** Repo-relative path, so CI logs and artifacts agree with editor links. */
export const toRepoPath = (file: string): string => {
  const index = file.indexOf(REPO_PATH_MARKER);
  return index >= 0 ? file.slice(index) : file;
};

const formatError = (error?: TestError): string => {
  if (!error) {
    return '';
  }
  const text = stripVTControlCharacters(error.stack ?? error.message).trim();
  return text.length > MAX_ERROR_CHARS ? `${text.slice(0, MAX_ERROR_CHARS)}…` : text;
};

const findFailingStep = (steps: TestStep[]): string => {
  let failing = '';
  for (const step of steps) {
    const nested = findFailingStep(step.steps);
    if (nested) {
      failing = `${step.title} › ${nested}`;
    } else if (step.error) {
      failing = step.title;
    }
  }
  return failing;
};

export const toOutcome = (
  result: TestResult,
  location: TestLocation,
  title: string,
): TestOutcome => ({
  attachments: result.attachments
    .map((attachment) => attachment.path)
    .filter((path): path is string => Boolean(path))
    .map(toRepoPath),
  durationMs: result.duration,
  error: formatError(result.error),
  failingStep: findFailingStep(result.steps),
  file: toRepoPath(location.file),
  line: location.line,
  retries: result.retry,
  status: result.status,
  title,
});

type FinalOutcome = { flaky: boolean; outcome: TestOutcome };

const finalsOf = (attempts: TestAttempt[][]): FinalOutcome[] =>
  attempts.flatMap((testAttempts) => {
    const last = testAttempts[testAttempts.length - 1];
    if (!last) {
      return [];
    }
    const flaky = testAttempts.length > 1 && testAttempts.some((attempt) => !attempt.passed);
    return [{ flaky, outcome: last.outcome }];
  });

const uniqueOutcomes = (attempts: TestAttempt[][]): TestOutcome[] =>
  finalsOf(attempts).map((final) => final.outcome);

export const buildFailureDigest = (attempts: TestAttempt[][]): FailureDigest => {
  const finals = finalsOf(attempts);
  const failures = finals
    .map((final) => final.outcome)
    .filter((outcome) => outcome.status === 'failed' || outcome.status === 'timedOut');
  const flaky = finals
    .filter((final) => final.flaky && final.outcome.status === 'passed')
    .map((final) => final.outcome);
  const skipped = finals.filter((final) => final.outcome.status === 'skipped').length;
  return {
    failed: failures,
    flaky,
    generatedAt: new Date().toISOString(),
    totals: {
      failed: failures.length,
      flaky: flaky.length,
      passed: finals.length - failures.length - skipped,
      skipped,
      total: finals.length,
    },
  };
};

export const buildTimings = (attempts: TestAttempt[][]): TimingEntry[] =>
  uniqueOutcomes(attempts)
    .map((outcome) => ({
      durationMs: outcome.durationMs,
      file: outcome.file,
      line: outcome.line,
      status: outcome.status,
      title: outcome.title,
    }))
    .sort((left, right) => right.durationMs - left.durationMs);

const formatDuration = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(1)}s`;

const renderOutcome = (outcome: TestOutcome): string[] => {
  const lines = [
    `### ${outcome.title}`,
    '',
    `- Location: \`${outcome.file}:${outcome.line}\``,
    `- Status: ${outcome.status} (attempt ${outcome.retries + 1})`,
    `- Duration: ${formatDuration(outcome.durationMs)}`,
  ];
  if (outcome.failingStep) {
    lines.push(`- Failing step: \`${outcome.failingStep}\``);
  }
  if (outcome.attachments.length > 0) {
    lines.push(`- Artifacts: ${outcome.attachments.map((path) => `\`${path}\``).join(', ')}`);
  }
  if (outcome.error) {
    lines.push('', '```', outcome.error, '```');
  }
  lines.push('');
  return lines;
};

export const renderMarkdown = (digest: FailureDigest): string => {
  const { totals } = digest;
  const lines = [
    '# Playwright failure digest',
    '',
    `Generated ${digest.generatedAt} · ${totals.failed} failed · ${totals.flaky} flaky · ` +
      `${totals.passed} passed · ${totals.skipped} skipped · ${totals.total} tests`,
    '',
  ];
  if (digest.failed.length > 0) {
    lines.push('## Failed', '');
    for (const outcome of digest.failed) {
      lines.push(...renderOutcome(outcome));
    }
  }
  if (digest.flaky.length > 0) {
    lines.push('## Flaky (passed on retry)', '');
    for (const outcome of digest.flaky) {
      lines.push(...renderOutcome(outcome));
    }
  }
  if (digest.failed.length === 0 && digest.flaky.length === 0) {
    lines.push('No failures or flaky tests.', '');
  }
  return lines.join('\n');
};

const firstLine = (value: string): string =>
  value
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0) ?? '';

const annotationMessage = (outcome: TestOutcome): string => {
  const parts = [outcome.failingStep, firstLine(outcome.error)].filter(Boolean);
  const message = parts.length > 0 ? parts.join(': ') : 'test failed';
  return message.length > ANNOTATION_MESSAGE_MAX_CHARS
    ? `${message.slice(0, ANNOTATION_MESSAGE_MAX_CHARS)}…`
    : message;
};

const sanitizeAnnotationValue = (value: string): string =>
  value.split('\n').join(' ').split('\r').join(' ').split('%').join('%25');

export const renderAnnotations = (digest: FailureDigest): string =>
  digest.failed
    .map((outcome) => {
      const message = annotationMessage(outcome);
      const properties = [
        `file=${outcome.file}`,
        `line=${outcome.line}`,
        `title=${sanitizeAnnotationValue(outcome.title)}`,
      ].join(',');
      return `::error ${properties}::${sanitizeAnnotationValue(message)}`;
    })
    .join('\n');
