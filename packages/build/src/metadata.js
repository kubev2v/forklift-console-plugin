/* eslint-env node */

import { execFileSync } from 'node:child_process';

/**
 * Source the current timestamp and git information and merge with info from `package.json`
 * to be used as build metadata.
 *
 * @param {import('type-fest').PackageJson} pkg
 */
export const getBuildMetadata = ({ name, version }) => {
  const now = new Date();
  let data = {};

  try {
    data = {
      packageName: name,
      packageVersion: version,
      buildDateTime: now.toISOString(),
      gitCommit: execFileSync('git', ['rev-parse', 'HEAD']).toString().trim(),
      gitBranch: execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD']).toString().trim(),
      gitTags: execFileSync('git', ['tag', '--points-at', 'HEAD'])
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean),
    };
  } catch {
    data = {
      packageName: name,
      packageVersion: version,
      buildDateTime: now.toISOString(),
    };
  }

  return data;
};

/**
 * @param {Record<string, string>} obj
 */
const entriesToTable = (obj) => {
  const padLength = Object.keys(obj).reduce(
    (maxLength, key) => (key.length > maxLength ? key.length : maxLength),
    0,
  );

  if (padLength === 0) {
    return [];
  }

  return Object.entries(obj).map(([key, value]) => `${key.padEnd(padLength)} : ${value}`);
};

const normalizeRepoUrl = (source) => {
  const url = source.url ? source.url : source;
  return url.replace(/git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
};

/**
 * @param {import('type-fest').PackageJson} pkg
 * @param {Record<string, string>} buildMetadata
 */
export const createBannerComment = ({ repository }, buildMetadata, headline) => {
  const info = [
    headline,
    headline && ' ',
    'Forklift Console Plugin',
    normalizeRepoUrl(repository),
    ' ',
    ...entriesToTable(buildMetadata),
  ].filter(Boolean);

  return `/*\n * ${info.join('\n * ')}\n */\n`;
};
