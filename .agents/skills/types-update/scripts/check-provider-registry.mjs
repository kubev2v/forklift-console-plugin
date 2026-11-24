#!/usr/bin/env node
/**
 * Verifies the hand-maintained provider registry in @forklift-ui/types.
 *
 * The CRD generators only refresh src/generated/**; the per-provider types, the
 * ProviderType union, the secret union and the aggregation unions are maintained
 * by hand (or rewritten by the types-update Phase 2.5 agent). This guard turns a
 * forgotten manual step into a hard failure.
 *
 * Usage:
 *   node scripts/check-provider-registry.mjs [--root <types-repo>]
 *                                            [--allow-missing-list=<provider,...>]
 *
 * Exit codes: 0 = registry consistent, 1 = problems found, 2 = bad arguments.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const USAGE = `Usage: node scripts/check-provider-registry.mjs [--root <types-repo>] [--allow-missing-list=<provider,...>]`;

const args = process.argv.slice(2);
let root = process.cwd();
const allowMissingList = new Set();

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === '--root') {
    root = args[index + 1] ?? root;
    index += 1;
  } else if (arg.startsWith('--allow-missing-list=')) {
    for (const name of arg.slice('--allow-missing-list='.length).split(',')) {
      if (name.trim()) {
        allowMissingList.add(name.trim());
      }
    }
  } else if (arg === '--help' || arg === '-h') {
    console.log(USAGE);
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${arg}\n${USAGE}`);
    process.exit(2);
  }
}

const typesRoot = resolve(root, 'src/types');
const providerRoot = join(typesRoot, 'provider');
const problems = [];

const read = (path) => readFileSync(path, 'utf8');

const exportedSymbols = (path, suffix) => {
  if (!existsSync(path)) {
    return [];
  }

  return [...read(path).matchAll(/export\s+(?:interface|type)\s+([A-Za-z0-9_]+)/g)]
    .map((match) => match[1])
    .filter((name) => name.endsWith(suffix));
};

const unionBlock = (path, marker) => {
  const content = read(path);
  const start = content.indexOf(marker);

  if (start === -1) {
    return '';
  }

  const end = content.indexOf(';', start);

  return end === -1 ? content.slice(start) : content.slice(start, end);
};

const expect = (condition, message) => {
  if (!condition) {
    problems.push(message);
  }
};

if (!existsSync(providerRoot)) {
  console.error(`Provider directory not found: ${providerRoot}`);
  process.exit(1);
}

const providerIndex = read(join(providerRoot, 'index.ts'));
const providerDirs = readdirSync(providerRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'base')
  .map((entry) => entry.name)
  .sort();

const providerInventory = read(join(typesRoot, 'ProviderInventory.ts'));
const providerVm = read(join(typesRoot, 'ProviderVM.ts'));
const providersInventoryList = read(join(typesRoot, 'ProvidersInventoryList.ts'));
const providerTypeUnion = unionBlock(
  join(typesRoot, 'ProviderSecret.ts'),
  'export type ProviderType =',
);

for (const provider of providerDirs) {
  const dir = join(providerRoot, provider);

  expect(
    providerIndex.includes(`'./${provider}'`),
    `provider/index.ts is missing \`export * from './${provider}'\``,
  );

  expect(existsSync(join(dir, 'Provider.ts')), `${provider}/Provider.ts is missing`);
  expect(existsSync(join(dir, 'VM.ts')), `${provider}/VM.ts is missing`);

  const providerSymbols = exportedSymbols(join(dir, 'Provider.ts'), 'Provider');

  expect(providerSymbols.length > 0, `${provider}/Provider.ts exports no *Provider type`);

  for (const symbol of providerSymbols) {
    expect(
      providerInventory.includes(symbol),
      `${symbol} (${provider}) is missing from ProviderInventory.ts`,
    );
  }

  const vmSymbols = exportedSymbols(join(dir, 'VM.ts'), 'VM');

  expect(vmSymbols.length > 0, `${provider}/VM.ts exports no *VM type`);

  for (const symbol of vmSymbols) {
    expect(providerVm.includes(symbol), `${symbol} (${provider}) is missing from ProviderVM.ts`);
  }

  if (!allowMissingList.has(provider)) {
    expect(
      new RegExp(`\\b${provider}\\??:`).test(providersInventoryList),
      `ProvidersInventoryList.ts has no \`${provider}\` entry`,
    );
  }

  expect(
    providerTypeUnion.includes(`'${provider}'`),
    `ProviderType union is missing '${provider}'`,
  );
}

const secretRoot = join(typesRoot, 'secret');
const providerSecretUnion = unionBlock(
  join(typesRoot, 'ProviderSecret.ts'),
  'export type ProviderSecret =',
);

if (existsSync(secretRoot)) {
  const secretFiles = readdirSync(secretRoot).filter(
    (file) => file.endsWith('.ts') && file !== 'index.ts',
  );

  for (const file of secretFiles) {
    const symbols = exportedSymbols(join(secretRoot, file), 'Secret');

    expect(symbols.length > 0, `secret/${file} exports no *Secret type`);

    for (const symbol of symbols) {
      expect(
        providerSecretUnion.includes(symbol),
        `${symbol} (secret/${file}) is missing from the ProviderSecret union`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error('Provider registry check failed:\n');
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(
    '\nFix the hand-maintained files (provider unions, ProviderType, secret union) before opening the types PR.',
  );
  process.exit(1);
}

console.log(`Provider registry OK: ${providerDirs.length} providers checked.`);
