import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseRule } from './generate.mjs';

describe('parseRule', () => {
  it('parses valid frontmatter', () => {
    const content = `---
description: Example rule
alwaysApply: false
globs: src/**/*.ts
---
Body
`;
    const { metadata } = parseRule(content, 'example.md');
    assert.equal(metadata.description, 'Example rule');
    assert.equal(metadata.alwaysApply, false);
    assert.equal(metadata.globs, 'src/**/*.ts');
  });

  it('rejects missing frontmatter', () => {
    assert.throws(() => parseRule('# no frontmatter\n', 'bad.md'), /missing YAML frontmatter/u);
  });

  it('rejects unknown metadata keys', () => {
    const content = `---
description: Example
alwaysApply: true
extra: true
---
`;
    assert.throws(() => parseRule(content, 'bad.md'), /unsupported rule metadata/u);
  });
});
