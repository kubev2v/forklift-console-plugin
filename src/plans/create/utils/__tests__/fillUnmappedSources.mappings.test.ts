import { describe, expect, it } from '@jest/globals';

import { fillUnmappedSources } from '../fillUnmappedSources';

const fieldIds = { mapField: 'mappings', sourceField: 'source', targetField: 'target' } as const;

describe('fillUnmappedSources - mappings', () => {
  it('fills empty rows then appends remaining sources', () => {
    const existing = [
      { source: { id: '', name: '  ' }, target: { id: 't1', name: 't1' } },
      { source: { id: 's0', name: 'kept' }, target: { id: 't0', name: 't0' } },
    ];
    const unmapped = [
      { id: 'u1', name: 'u1' },
      { id: 'u2', name: 'u2' },
      { id: 'u3', name: 'u3' },
    ];

    const result = fillUnmappedSources({
      existingMappings: existing,
      fieldIds,
      targetValue: { id: 'default', name: 'default' },
      unmappedSources: unmapped,
    });

    expect(result).toEqual([
      { source: { id: 'u1', name: 'u1' }, target: { id: 't1', name: 't1' } },
      { source: { id: 's0', name: 'kept' }, target: { id: 't0', name: 't0' } },
      { source: { id: 'u2', name: 'u2' }, target: { id: 'default', name: 'default' } },
      { source: { id: 'u3', name: 'u3' }, target: { id: 'default', name: 'default' } },
    ]);
  });

  it('returns existing mappings unchanged when there are no unmapped sources', () => {
    const existing = [{ source: { id: 's', name: 's' }, target: { id: 't', name: 't' } }];

    expect(
      fillUnmappedSources({
        existingMappings: existing,
        fieldIds,
        targetValue: { id: 'd', name: 'd' },
        unmappedSources: [],
      }),
    ).toEqual(existing);
  });
});
