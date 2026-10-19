import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ignore from 'ignore';
import { parse } from 'yaml';
import {
  CURSOR_RULES_DIR,
  REPO_ROOT,
  generateCursorRules,
  loadCanonicalRules,
  parseRule,
  renderCursorWrapper,
} from './generate.mjs';
import { selectRules } from './select-rules.mjs';

const CANONICAL_MDC_REFERENCE = /\.mdc(?:[`'")\s]|$)/u;

const gitignoreMatcher = ignore().add(fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf8'));

const migrationManifestPath = path.join(REPO_ROOT, '.agents/migration-manifest.json');
const report = [];
const fail = (message) => {
  report.push(`FAIL ${message}`);
};
const pass = (message) => {
  report.push(`PASS ${message}`);
};

const walkFiles = (directory, { skip = new Set() } = {}) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && skip.has(entry.name)) return [];
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(absolutePath, { skip });
    return entry.isFile() ? [absolutePath] : [];
  });
};

const checkRuleFiles = () => {
  const rules = loadCanonicalRules();
  assert.ok(rules.length > 0, 'No canonical rules were found');
  assert.ok(fs.existsSync(migrationManifestPath), 'Migration manifest is missing');
  const manifest = JSON.parse(fs.readFileSync(migrationManifestPath, 'utf8'));
  const manifestRulePaths = manifest.rules.map((rule) => rule.canonical).sort();
  const canonicalRulePaths = rules.map(({ relativePath }) => `.agents/rules/${relativePath}`).sort();
  const manifestWrapperPaths = manifest.rules.map((rule) => rule.cursorWrapper).sort();
  const actualWrapperPaths = walkFiles(CURSOR_RULES_DIR)
    .filter((file) => file.endsWith('.mdc'))
    .map((file) => path.relative(REPO_ROOT, file).split(path.sep).join('/'))
    .sort();

  for (const rulePath of manifestRulePaths) {
    assert.ok(canonicalRulePaths.includes(rulePath), `Missing migrated canonical rule: ${rulePath}`);
  }
  assert.equal(new Set(canonicalRulePaths).size, canonicalRulePaths.length, 'Duplicate canonical rule paths');
  assert.equal(new Set(manifestRulePaths).size, manifestRulePaths.length, 'Duplicate manifest rule paths');
  assert.deepEqual(manifestRulePaths, canonicalRulePaths, 'Manifest canonical paths do not match discovered rules');
  assert.equal(new Set(manifestWrapperPaths).size, manifestWrapperPaths.length, 'Duplicate manifest wrapper paths');
  assert.deepEqual(manifestWrapperPaths, actualWrapperPaths, 'Manifest wrapper paths do not match discovered wrappers');
  assert.equal(
    manifest.rules.length,
    canonicalRulePaths.length,
    'Migration manifest rule count must match discovered canonical rules',
  );

  assert.equal(actualWrapperPaths.length, rules.length, 'Cursor wrapper count does not match canonical rule count');

  for (const rule of rules) {
    const wrapperPath = path.join(CURSOR_RULES_DIR, rule.relativePath.replace(/\.md$/u, '.mdc'));
    assert.ok(fs.existsSync(wrapperPath), `Missing Cursor wrapper for ${rule.relativePath}`);
    assert.equal(
      fs.readFileSync(wrapperPath, 'utf8'),
      renderCursorWrapper(rule.relativePath, rule.metadata),
      `Stale wrapper metadata or reference: ${path.relative(REPO_ROOT, wrapperPath)}`,
    );
    const canonical = fs.readFileSync(rule.absolutePath, 'utf8');
    parseRule(canonical, rule.relativePath);
  }

  const context = rules.find(({ relativePath }) => relativePath === 'project-context.md');
  assert.ok(context?.metadata.alwaysApply, 'project-context must remain always applied');
  pass(`validated ${rules.length} canonical rules and generated wrappers`);
  return rules;
};

const checkSelectorCases = (rules) => {
  const getByPath = (relativePath) => rules.find((rule) => rule.relativePath === relativePath);
  const checks = [
    {
      name: 'i18n',
      rule: 'i18n.md',
      positive: ['locales/en/plugin.json', 'src/utils/i18n.ts', 'src/components/PlanTranslation.tsx'],
      negative: ['src/components/PlanDetails.tsx'],
    },
    {
      name: 'react-components',
      rule: 'react-components.md',
      positive: ['src/components/PlanDetails.tsx'],
      negative: ['src/components/planDetails.ts'],
    },
    {
      name: 'selectors',
      rule: 'selectors.md',
      positive: ['src/utils/resource.ts', 'src/components/Resource.tsx'],
      negative: ['src/styles/resource.scss'],
    },
    {
      name: 'styles',
      rule: 'styles.md',
      positive: ['src/styles/component.scss'],
      negative: ['src/styles/component.css'],
    },
    {
      name: 'testing',
      rule: 'testing.md',
      positive: ['src/utils/plan.test.ts', 'jest.config.ts', 'testing/playwright/plan.spec.ts'],
      negative: ['src/utils/plan.ts'],
    },
    {
      name: 'typescript',
      rule: 'typescript.md',
      positive: ['src/utils/plan.ts', 'src/components/Plan.tsx'],
      negative: ['src/utils/plan.js'],
    },
  ];

  for (const check of checks) {
    const target = getByPath(check.rule);
    assert.ok(target, `Missing glob rule ${check.name}`);
    for (const file of check.positive) {
      const result = selectRules(rules, [file]);
      assert.ok(result.matched.includes(target), `${check.name} should match ${file}`);
    }
    for (const file of check.negative) {
      const result = selectRules(rules, [file]);
      assert.ok(!result.matched.includes(target), `${check.name} should not match ${file}`);
    }
  }

  const noFiles = selectRules(rules, []);
  assert.deepEqual(noFiles.always.map(({ relativePath }) => relativePath), ['project-context.md']);
  assert.ok(noFiles.descriptionCandidates.some(({ relativePath }) => relativePath === 'backend/providers/ocp.md'));
  assert.equal(noFiles.matched.length, 0, 'No path-scoped rules should load without paths');
  const workflowRule = getByPath('workflows/feature-development.md');
  if (workflowRule) {
    const workflowResult = selectRules(rules, []);
    assert.ok(
      workflowResult.descriptionCandidates.some(({ relativePath }) => relativePath === workflowRule.relativePath),
      'feature-development should be a description-based candidate without file paths',
    );
  }
  pass('tested positive and negative path cases for all six glob rules');
};

const checkCanonicalRuleReferences = (rules) => {
  const failures = [];
  for (const rule of rules) {
    const content = fs.readFileSync(rule.absolutePath, 'utf8');
    if (CANONICAL_MDC_REFERENCE.test(content)) {
      failures.push(rule.relativePath);
    }
  }
  assert.equal(failures.length, 0, `Canonical rules must not reference .mdc wrappers:\n${failures.join('\n')}`);
  pass('canonical rules contain no .mdc wrapper references');
};

const resolveSkillSymlinkTarget = (absolutePath) => {
  try {
    return fs.realpathSync(absolutePath);
  } catch {
    fail(`Broken skill symlink: ${path.relative(REPO_ROOT, absolutePath)}`);
    return undefined;
  }
};

const DEV_HELPER_RUNTIME_DIRS = new Set([
  'audit',
  'dashboard',
  'lessons',
  'repo-pr-lessons',
  'state',
  'summaries',
]);

const collectSkillEntry = (entry, directory, skillFiles, visit) => {
  if (entry.name === '.git' || entry.name === 'node_modules') return;
  if (DEV_HELPER_RUNTIME_DIRS.has(entry.name)) return;
  const absolutePath = path.join(directory, entry.name);
  if (entry.isSymbolicLink()) {
    const target = resolveSkillSymlinkTarget(absolutePath);
    if (!target) return;
    const relativeTarget = path.relative(REPO_ROOT, target);
    if (relativeTarget.startsWith('..')) {
      fail(`Skill symlink escapes repository: ${path.relative(REPO_ROOT, absolutePath)}`);
      return;
    }
    if (fs.statSync(target).isDirectory()) visit(target);
    return;
  }
  if (entry.isDirectory()) {
    visit(absolutePath);
    return;
  }
  if (entry.isFile() && entry.name === 'SKILL.md') skillFiles.push(absolutePath);
};

const walkSkills = (skillsRoot) => {
  const skillFiles = [];
  const visitedDirectories = new Set();
  const visit = (directory) => {
    let realDirectory;
    try {
      realDirectory = fs.realpathSync(directory);
    } catch {
      fail(`Broken skill symlink: ${path.relative(REPO_ROOT, directory)}`);
      return;
    }
    if (visitedDirectories.has(realDirectory)) return;
    visitedDirectories.add(realDirectory);

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      collectSkillEntry(entry, directory, skillFiles, visit);
    }
  };
  visit(skillsRoot);
  return skillFiles.sort((left, right) => left.localeCompare(right));
};

const isIgnoredByGit = (relativePath) => {
  const normalizedPath = relativePath.split(path.sep).join('/');
  return gitignoreMatcher.ignores(normalizedPath);
};

const STALE_CURSOR_SKILL_PATH = /\.cursor\/(?:rules|skills)\//u;
const INCOMPATIBLE_TOOL_PATTERN =
  /\bAskQuestion(?: tool)?\b|required_permissions|StrReplace tools|Cursor sandbox blocks writes/u;
const LOCAL_SCRIPT_EXTENSION = /\.(?:sh|py|js|mjs|ts|tsx)$/u;
const LOCAL_REFERENCE_EXTENSION = /\.(?:md|mdx|mdc|yaml|yml|json|toml)$/u;
const SKILL_REFERENCE_PREFIXES = ['references/', 'assets/', '.agents/rules/'];

const findSkillRoot = (skillsRoot, fileDirectory) => {
  let currentDirectory = fileDirectory;
  while (currentDirectory.startsWith(`${skillsRoot}${path.sep}`) || currentDirectory === skillsRoot) {
    if (fs.existsSync(path.join(currentDirectory, 'SKILL.md'))) return currentDirectory;
    currentDirectory = path.dirname(currentDirectory);
  }
  return fileDirectory;
};

const collectMarkdownLinkFailures = (skillFile, fileDirectory, content, failures) => {
  const markdownLinks = [...content.matchAll(/\]\(([^)]+)\)/gu)];
  for (const [, rawTarget] of markdownLinks) {
    const target = rawTarget.trim().split(/\s+/u, 1)[0].replace(/^<|>$/gu, '');
    if (!target || /^(?:https?:|mailto:|#)/u.test(target) || /[${}]/u.test(target)) continue;
    const absoluteTarget = target.startsWith('.agents/')
      ? path.resolve(REPO_ROOT, target)
      : path.resolve(fileDirectory, target);
    if (!absoluteTarget.startsWith(`${REPO_ROOT}${path.sep}`) && absoluteTarget !== REPO_ROOT) continue;
    if (!fs.existsSync(absoluteTarget)) failures.push(`${skillFile}: missing Markdown reference ${target}`);
  }
};

const codePathTargetExists = (candidate, fileDirectory, skillRoot) => {
  const pathBases = candidate.startsWith('.agents/')
    ? [REPO_ROOT]
    : [fileDirectory, skillRoot, REPO_ROOT];
  return pathBases.some((base) => {
    const absoluteTarget = path.resolve(base, candidate);
    const staticPrefix = absoluteTarget.split(/[${}<]/u, 1)[0];
    return fs.existsSync(staticPrefix);
  });
};

const collectCodePathFailures = (skillFile, fileDirectory, skillRoot, content, failures) => {
  const codePaths = [...content.matchAll(/`([^`]+)`/gu)].map(([, token]) => token.trim());
  for (const token of codePaths) {
    const candidate = token.split(/\s+/u, 1)[0].replace(/^\(|\)$/gu, '');
    if (/[*{}<>…]/u.test(candidate)) continue;
    const isScript = LOCAL_SCRIPT_EXTENSION.test(candidate) &&
      (candidate.startsWith('scripts/') || candidate.startsWith('.agents/skills/'));
    const isReference = LOCAL_REFERENCE_EXTENSION.test(candidate) &&
      SKILL_REFERENCE_PREFIXES.some((prefix) => candidate.startsWith(prefix));
    if (!isScript && !isReference) continue;
    if (!codePathTargetExists(candidate, fileDirectory, skillRoot)) {
      failures.push(`${skillFile}: missing script reference ${candidate}`);
    }
  }
};

const checkSkillReferences = () => {
  const failures = [];
  const skillsRoot = path.join(REPO_ROOT, '.agents/skills');
  const markdownFiles = walkFiles(skillsRoot, {
    skip: new Set(['.git', 'node_modules', 'state', 'audit', 'lessons', 'dashboard', 'summaries', 'repo-pr-lessons']),
  }).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

  for (const skillFile of markdownFiles) {
    const fileDirectory = path.dirname(skillFile);
    const skillRoot = findSkillRoot(skillsRoot, fileDirectory);
    const content = fs.readFileSync(skillFile, 'utf8');
    if (STALE_CURSOR_SKILL_PATH.test(content)) failures.push(`${skillFile}: stale Cursor rules/skills path`);
    if (INCOMPATIBLE_TOOL_PATTERN.test(content)) failures.push(`${skillFile}: stale client-specific tool instruction`);
    collectMarkdownLinkFailures(skillFile, fileDirectory, content, failures);
    collectCodePathFailures(skillFile, fileDirectory, skillRoot, content, failures);
  }

  if (failures.length > 0) throw new Error(failures.join('\n'));
  pass('validated skill Markdown links, script paths, and absence of stale Cursor skill/rule paths');
};

const checkSkills = () => {
  const skillRoot = path.join(REPO_ROOT, '.agents/skills');
  const skillFiles = walkSkills(skillRoot);
  const names = new Map();
  for (const skillFile of skillFiles) {
    const content = fs.readFileSync(skillFile, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
    assert.ok(match, `${skillFile}: missing frontmatter`);
    const metadata = parse(match[1]);
    assert.equal(typeof metadata.name, 'string', `${skillFile}: missing name`);
    assert.equal(typeof metadata.description, 'string', `${skillFile}: missing description`);
    assert.ok(metadata.description.trim().length > 0, `${skillFile}: empty description`);
    if (names.has(metadata.name)) {
      throw new Error(`Duplicate skill name ${metadata.name}: ${names.get(metadata.name)} and ${skillFile}`);
    }
    names.set(metadata.name, skillFile);
  }

  const requiredSharedNames = [
    'backend-analyzer', 'bug-report', 'cve-remediation', 'forklift-rules',
    'frontend-analyzer', 'i18n-memsource', 'konflux-deps-update-remediation',
    'pr-monitor', 'reviewer', 'types-update', 'waiting-for-build',
  ];
  for (const name of requiredSharedNames) {
    assert.ok(names.has(name), `Missing expected shared skill ${name}`);
    const relativeSkillPath = path.relative(REPO_ROOT, names.get(name));
    assert.ok(!isIgnoredByGit(relativeSkillPath), `Shared skill must not be ignored: ${name}`);
  }

  assert.ok(names.has('dev-helper'), 'Missing dev-helper skill');
  const devHelperSkillPath = path.relative(REPO_ROOT, names.get('dev-helper'));
  assert.ok(!isIgnoredByGit(devHelperSkillPath), 'dev-helper skill must be tracked in Git');

  if (names.has('repo-pr-lessons')) {
    const repoPrLessonsPath = path.relative(REPO_ROOT, names.get('repo-pr-lessons'));
    assert.ok(isIgnoredByGit(repoPrLessonsPath), 'repo-pr-lessons must stay gitignored (local batch tool)');
  }

  for (const name of ['konflux-deps-update-remediation', 'reviewer']) {
    const metadataPath = path.join(skillRoot, name, 'agents/openai.yaml');
    assert.ok(fs.existsSync(metadataPath), `Missing Codex invocation metadata for ${name}`);
    const metadata = parse(fs.readFileSync(metadataPath, 'utf8'));
    assert.equal(metadata.policy?.allow_implicit_invocation, false, `${name} should remain explicit-only`);
  }

  const statePaths = [
    '.agents/skills/backend-analyzer/state.json',
    '.agents/skills/frontend-analyzer/state.json',
    '.agents/skills/i18n-memsource/state.json',
    '.agents/skills/cve-remediation/config.yaml',
    '.agents/skills/personal-i18n-memsource/SETUP.md',
    '.agents/skills/dev-helper/state/',
    '.agents/skills/dev-helper/dev-helper.config.json',
    '.agents/skills/dev-helper/audit/',
    '.agents/skills/dev-helper/repo-pr-lessons/',
  ];
  for (const statePath of statePaths) {
    assert.ok(isIgnoredByGit(statePath), `Local data must be ignored by Git: ${statePath}`);
  }

  checkSkillReferences();
  pass(`validated ${skillFiles.length} skill entrypoints with unique names and required metadata`);
};

const checkCodexFiles = () => {
  const configPath = path.join(REPO_ROOT, '.codex/config.toml');
  assert.ok(fs.existsSync(configPath), 'Missing project Codex config');
  const config = fs.readFileSync(configPath, 'utf8');
  assert.match(config, /^project_doc_max_bytes\s*=\s*65536$/mu);
  for (const server of ['patternfly-mcp', 'playwright', 'video-recorder']) {
    assert.ok(config.includes(`[mcp_servers.${server}]`), `Missing MCP config: ${server}`);
  }
  assert.match(config, /env_vars\s*=\s*\["VIDEO_RECORDER_OUTPUT_DIR"\]/u);
  assert.doesNotMatch(config, /\[mcp_servers\.(?:jira|memsource)\]/iu);
  assert.doesNotMatch(config, /VIDEO_RECORDER_OUTPUT_DIR\s*=\s*"[^"]+"/u);

  for (const agent of ['architect', 'developer', 'forklift-expert', 'qe-agent', 'security-reviewer', 'ux-reviewer']) {
    const agentPath = path.join(REPO_ROOT, `.codex/agents/${agent}.toml`);
    assert.ok(fs.existsSync(agentPath), `Missing Codex agent: ${agent}`);
    const agentContent = fs.readFileSync(agentPath, 'utf8');
    assert.match(agentContent, new RegExp(`^name = "${agent}"$`, 'mu'));
    assert.match(agentContent, /^description = ".+"$/mu);
    assert.match(agentContent, /^developer_instructions = ".+"$/mu);
    const ruleReferences = [...agentContent.matchAll(/(\.agents\/rules\/[A-Za-z0-9_./-]+\.md)/gu)]
      .map(([, rulePath]) => rulePath);
    assert.ok(ruleReferences.length > 0, `Codex agent ${agent} has no canonical rule reference`);
    for (const rulePath of ruleReferences) {
      assert.ok(fs.existsSync(path.join(REPO_ROOT, rulePath)), `Codex agent ${agent} references missing rule ${rulePath}`);
    }
  }
  pass('validated trusted-project Codex config, MCP names, and six persona-agent definitions');
};

const main = () => {
  const rules = checkRuleFiles();
  checkCanonicalRuleReferences(rules);
  checkSelectorCases(rules);
  generateCursorRules({ check: true });
  pass('generate.mjs --check: Cursor wrappers match canonical frontmatter');
  checkSkills();
  checkCodexFiles();
  console.log(report.join('\n'));
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    console.error(report.join('\n'));
    process.exitCode = 1;
  }
}
