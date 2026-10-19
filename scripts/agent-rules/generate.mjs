import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CANONICAL_RULES_DIR = path.join(REPO_ROOT, '.agents/rules');
export const CURSOR_RULES_DIR = path.join(REPO_ROOT, '.cursor/rules');

const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(absolutePath);
    return entry.isFile() ? [absolutePath] : [];
  });
};

const walkMarkdown = (directory) => walkFiles(directory).filter((file) => file.endsWith('.md'));

export const parseRule = (content, filePath = '<rule>') => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!match) throw new Error(`${filePath}: missing YAML frontmatter`);

  const metadata = parse(match[1]);
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new Error(`${filePath}: frontmatter must be a YAML mapping`);
  }
  if (typeof metadata.description !== 'string' || metadata.description.trim() === '') {
    throw new Error(`${filePath}: description must be a non-empty string`);
  }
  if (typeof metadata.alwaysApply !== 'boolean') {
    throw new TypeError(`${filePath}: alwaysApply must be a boolean`);
  }
  if (
    metadata.globs !== undefined &&
    !(typeof metadata.globs === 'string' ||
      (Array.isArray(metadata.globs) && metadata.globs.every((glob) => typeof glob === 'string')))
  ) {
    throw new Error(`${filePath}: globs must be a string or an array of strings`);
  }

  const unknownKeys = Object.keys(metadata).filter(
    (key) => !['description', 'globs', 'alwaysApply'].includes(key),
  );
  if (unknownKeys.length > 0) {
    throw new Error(`${filePath}: unsupported rule metadata: ${unknownKeys.join(', ')}`);
  }

  return { metadata, body: content.slice(match[0].length) };
};

const cursorPathForCanonical = (relativePath) =>
  path.join(CURSOR_RULES_DIR, relativePath.replace(/\.md$/u, '.mdc'));

export const renderCursorWrapper = (relativePath, metadata) => {
  const frontmatter = stringify(metadata, { lineWidth: 0 });
  return `---\n${frontmatter}---\n@.agents/rules/${relativePath}\n`;
};

export const loadCanonicalRules = () =>
  walkMarkdown(CANONICAL_RULES_DIR)
    .map((absolutePath) => {
      const relativePath = path.relative(CANONICAL_RULES_DIR, absolutePath).split(path.sep).join('/');
      const content = fs.readFileSync(absolutePath, 'utf8');
      const { metadata } = parseRule(content, relativePath);
      return { absolutePath, relativePath, metadata };
    })
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

export const generateCursorRules = ({ check = false, prune = false } = {}) => {
  const rules = loadCanonicalRules();
  if (rules.length === 0) throw new Error(`No canonical rules found in ${CANONICAL_RULES_DIR}`);

  const expectedPaths = new Set(rules.map(({ relativePath }) => cursorPathForCanonical(relativePath)));
  const existingWrappers = walkFiles(CURSOR_RULES_DIR).filter((file) => file.endsWith('.mdc'));
  const staleWrappers = existingWrappers.filter((file) => !expectedPaths.has(file));

  if (staleWrappers.length > 0 && !prune) {
    throw new Error(
      `Stale Cursor wrappers found; inspect and rerun with --prune to remove them:\n${staleWrappers
        .map((file) => path.relative(REPO_ROOT, file))
        .join('\n')}`,
    );
  }

  const changes = [];
  for (const rule of rules) {
    const wrapperPath = cursorPathForCanonical(rule.relativePath);
    const expectedContent = renderCursorWrapper(rule.relativePath, rule.metadata);
    const currentContent = fs.existsSync(wrapperPath) ? fs.readFileSync(wrapperPath, 'utf8') : undefined;

    if (currentContent !== expectedContent) {
      changes.push(path.relative(REPO_ROOT, wrapperPath));
      if (!check) {
        fs.mkdirSync(path.dirname(wrapperPath), { recursive: true });
        fs.writeFileSync(wrapperPath, expectedContent);
      }
    }
  }

  if (prune && !check) {
    for (const stalePath of staleWrappers) {
      fs.unlinkSync(stalePath);
      changes.push(path.relative(REPO_ROOT, stalePath));
    }
  }

  return { count: rules.length, changes };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const prune = process.argv.includes('--prune');
  try {
    const result = generateCursorRules({ check, prune });
    if (check && result.changes.length > 0) {
      console.error(`Cursor rule wrappers are stale:\n${result.changes.join('\n')}`);
      process.exitCode = 1;
    } else if (check) {
      console.log(`Validated ${result.count} Cursor rule wrappers.`);
    } else {
      console.log(`Generated ${result.count} Cursor rule wrappers; changed ${result.changes.length}.`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
