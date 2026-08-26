import { affinityToRowsData } from '../affinityToRowsData';
import { AffinityCondition, AffinityType } from '../types';

import {
  emptyAffinity,
  expectedNodeRequiredRow,
  nodePreferredAffinity,
  nodeRequiredAffinity,
} from './affinityToRowsData.fixtures';

describe('affinityToRowsData - node', () => {
  it('returns empty array for empty affinity object', () => {
    expect(affinityToRowsData(emptyAffinity)).toEqual([]);
  });

  it('maps required node terms with expression and field ids', () => {
    const rows = affinityToRowsData(nodeRequiredAffinity);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject(expectedNodeRequiredRow);
    expect(rows[0].expressions).toEqual([
      { id: 0, key: 'zone', operator: 'In', values: ['east'] },
      { id: 1, key: 'disk', operator: 'Exists', values: [] },
    ]);
    expect(rows[0].fields).toEqual([
      { id: 0, key: 'metadata.name', operator: 'In', values: ['node-1'] },
    ]);
  });

  it('maps preferred node terms with weight and defaults missing values to []', () => {
    const rows = affinityToRowsData(nodePreferredAffinity);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      condition: AffinityCondition.Preferred,
      id: 'node-preferred-0',
      type: AffinityType.Node,
      weight: 50,
    });
    expect(rows[0].expressions).toEqual([
      { id: 0, key: 'tier', operator: 'NotIn', values: ['dev'] },
    ]);
    expect(rows[0].fields).toBeUndefined();
  });

  it('indexes multiple required node terms sequentially', () => {
    const rows = affinityToRowsData({
      nodeAffinity: {
        requiredDuringSchedulingIgnoredDuringExecution: {
          nodeSelectorTerms: [{ matchExpressions: [] }, { matchExpressions: [] }],
        },
      },
    });

    expect(rows.map((row) => row.id)).toEqual(['node-required-0', 'node-required-1']);
  });
});
