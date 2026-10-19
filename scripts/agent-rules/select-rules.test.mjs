import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { splitGlobList } from './select-rules.mjs';

describe('splitGlobList', () => {
  it('splits top-level commas but not commas inside braces', () => {
    assert.deepEqual(splitGlobList('src/{a,b}.ts, src/c.ts'), ['src/{a,b}.ts', 'src/c.ts']);
  });

  it('returns empty array for blank string', () => {
    assert.deepEqual(splitGlobList('   '), []);
  });

  it('passes through arrays unchanged', () => {
    assert.deepEqual(splitGlobList(['a.ts', 'b.ts']), ['a.ts', 'b.ts']);
  });
});
