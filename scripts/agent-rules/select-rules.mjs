import picomatch from 'picomatch';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCanonicalRules } from './generate.mjs';

const pushTrimmedPattern = (patterns, segment) => {
  const trimmed = segment.trim();
  if (trimmed) patterns.push(trimmed);
};

const updateDelimiterDepth = (character, depths) => {
  if (character === '{') depths.brace += 1;
  if (character === '}') depths.brace = Math.max(0, depths.brace - 1);
  if (character === '[') depths.bracket += 1;
  if (character === ']') depths.bracket = Math.max(0, depths.bracket - 1);
};

export const splitGlobList = (globs) => {
  if (Array.isArray(globs)) return globs;
  if (typeof globs !== 'string' || globs.trim() === '') return [];

  const patterns = [];
  let current = '';
  const depths = { brace: 0, bracket: 0 };

  for (const character of globs) {
    updateDelimiterDepth(character, depths);
    const atTopLevel = depths.brace === 0 && depths.bracket === 0;
    if (character === ',' && atTopLevel) {
      pushTrimmedPattern(patterns, current);
      current = '';
      continue;
    }
    current += character;
  }

  pushTrimmedPattern(patterns, current);
  return patterns;
};

export const selectRules = (rules, files = []) => {
  const normalizedFiles = files.map((file) => file.replace(/^\.\//u, '').replaceAll('\\', '/'));
  const always = rules.filter(({ metadata }) => metadata.alwaysApply);
  const matched = rules.filter(({ metadata }) => {
    if (metadata.alwaysApply || metadata.globs === undefined) return false;
    const patterns = splitGlobList(metadata.globs);
    return patterns.some((pattern) => {
      const matches = picomatch(pattern, { dot: true });
      return normalizedFiles.some((file) => matches(file));
    });
  });
  const descriptionCandidates = rules.filter(
    ({ metadata }) => !metadata.alwaysApply && metadata.globs === undefined,
  );

  return { always, matched, descriptionCandidates };
};

const parseArguments = (argv) => {
  const files = [];
  let json = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--file') {
      if (argv[index + 1]) files.push(argv[++index]);
    } else if (arg === '--files') {
      while (argv[index + 1] && !argv[index + 1].startsWith('--')) files.push(argv[++index]);
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown argument: ${arg}`);
    } else {
      files.push(arg);
    }
  }

  return { files, json };
};

const main = () => {
  const { files, json } = parseArguments(process.argv.slice(2));
  const result = selectRules(loadCanonicalRules(), files);
  const output = {
    files,
    always: result.always.map(({ relativePath, metadata }) => ({
      description: metadata.description,
      path: `.agents/rules/${relativePath}`,
    })),
    pathMatches: result.matched.map(({ relativePath, metadata }) => ({
      description: metadata.description,
      path: `.agents/rules/${relativePath}`,
    })),
    descriptionCandidates: result.descriptionCandidates.map(({ relativePath, metadata }) => ({
      description: metadata.description,
      path: `.agents/rules/${relativePath}`,
    })),
  };

  if (json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  for (const [title, rules] of [
    ['Always include', output.always],
    ['Matched by file path', output.pathMatches],
    ['Description-based candidates; select only those relevant to the task', output.descriptionCandidates],
  ]) {
    console.log(`${title}:`);
    for (const rule of rules) console.log(`- ${rule.path} — ${rule.description}`);
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
