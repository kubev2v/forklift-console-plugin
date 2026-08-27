jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  Operator: {
    DoesNotExist: 'DoesNotExist',
    Exists: 'Exists',
    In: 'In',
    NotIn: 'NotIn',
  },
}));

import { rowsDataToAffinity } from '../rowsDataToAffinity';
import { AffinityCondition, AffinityType } from '../types';

const baseExpr = {
  id: 1,
  key: 'key',
  operator: 'In' as const,
  values: ['v1'],
};

describe('rowsDataToAffinity - behavior', () => {
  it('returns null for empty rows', () => {
    expect(rowsDataToAffinity([])).toBeNull();
  });

  it('maps required node affinity expressions and fields', () => {
    const affinity = rowsDataToAffinity([
      {
        condition: AffinityCondition.Required,
        expressions: [baseExpr],
        fields: [{ ...baseExpr, id: 2, key: 'field', operator: 'Exists', values: ['x'] }],
        id: '1',
        type: AffinityType.Node,
      },
    ]);

    const term =
      affinity?.nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution
        ?.nodeSelectorTerms?.[0];
    expect(term?.matchExpressions?.[0]).toMatchObject({
      key: 'key',
      operator: 'In',
      values: ['v1'],
    });
    expect(term?.matchFields?.[0]).toMatchObject({ key: 'field', operator: 'Exists', values: [] });
  });

  it('maps preferred node affinity with weight', () => {
    const affinity = rowsDataToAffinity([
      {
        condition: AffinityCondition.Preferred,
        expressions: [baseExpr],
        id: '1',
        type: AffinityType.Node,
        weight: 50,
      },
    ]);

    expect(affinity?.nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution).toEqual([
      {
        preference: {
          matchExpressions: [expect.objectContaining({ key: 'key' })],
          matchFields: [],
        },
        weight: 50,
      },
    ]);
  });

  it('maps pod and podAnti terms', () => {
    const affinity = rowsDataToAffinity([
      {
        condition: AffinityCondition.Required,
        expressions: [baseExpr],
        id: '1',
        topologyKey: 'kubernetes.io/hostname',
        type: AffinityType.Pod,
      },
      {
        condition: AffinityCondition.Preferred,
        expressions: [baseExpr],
        id: '2',
        topologyKey: 'topology.kubernetes.io/zone',
        type: AffinityType.PodAnti,
        weight: 10,
      },
    ]);

    expect(affinity?.podAffinity?.requiredDuringSchedulingIgnoredDuringExecution).toHaveLength(1);
    expect(affinity?.podAntiAffinity?.preferredDuringSchedulingIgnoredDuringExecution).toEqual([
      {
        podAffinityTerm: {
          labelSelector: { matchExpressions: [expect.objectContaining({ key: 'key' })] },
          topologyKey: 'topology.kubernetes.io/zone',
        },
        weight: 10,
      },
    ]);
  });
});
