import picomatch from 'picomatch';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCanonicalRules } from '../../../../scripts/agent-rules/generate.mjs';

export const splitGlobList = (globs) => {
  if (Array.isArray(globs)) return globs;
  if (typeof globs !== 'string' || globs.trim() === '') return [];

  const patterns = [];
  let current = '';
  let braceDepth = 0;
  let bracketDepth = 0;

  for (const character of globs) {
    if (character === '{') braceDepth += 1;
    if (character === '}') braceDepth = Math.max(0, braceDepth - 1);
    if (character === '[') bracketDepth += 1;
    if (character === ']') bracketDepth = Math.max(0, bracketDepth - 1);

    if (character === ',' && braceDepth === 0 && bracketDepth === 0) {
      if (current.trim()) patterns.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }

  if (current.trim()) patterns.push(current.trim());
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
    if (argv[index] === '--json') {
      json = true;
    } else if (argv[index] === '--file') {
      if (argv[index + 1]) files.push(argv[++index]);
    } else if (argv[index] === '--files') {
      while (argv[index + 1] && !argv[index + 1].startsWith('--')) files.push(argv[++index]);
    } else {
      throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }

  return { files, json };
};

const main = () => {
  const { files, json } = parseArguments(process.argv.slice(2));
  const result = selectRules(loadCanonicalRules(), files);
  const output = {
    files,
    always: result.always.map(({ relativePath, metadata }) => ({ path: `.agents/rules/${relativePath}`, description: metadata.description })),
    pathMatches: result.matched.map(({ relativePath, metadata }) => ({ path: `.agents/rules/${relativePath}`, description: metadata.description })),
    descriptionCandidates: result.descriptionCandidates.map(({ relativePath, metadata }) => ({ path: `.agents/rules/${relativePath}`, description: metadata.description })),
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
