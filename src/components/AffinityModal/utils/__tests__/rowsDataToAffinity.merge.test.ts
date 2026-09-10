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

describe('rowsDataToAffinity - merge', () => {
  it('merges required and preferred node, pod, and podAnti affinity', () => {
    const affinity = rowsDataToAffinity([
      {
        condition: AffinityCondition.Required,
        expressions: [baseExpr],
        id: 'node-req',
        type: AffinityType.Node,
      },
      {
        condition: AffinityCondition.Preferred,
        expressions: [{ ...baseExpr, key: 'pref' }],
        id: 'node-pref',
        type: AffinityType.Node,
        weight: 30,
      },
      {
        condition: AffinityCondition.Required,
        expressions: [baseExpr],
        id: 'pod-req',
        topologyKey: 'kubernetes.io/hostname',
        type: AffinityType.Pod,
      },
      {
        condition: AffinityCondition.Preferred,
        expressions: [{ ...baseExpr, key: 'pod-pref' }],
        id: 'pod-pref',
        topologyKey: 'topology.kubernetes.io/zone',
        type: AffinityType.Pod,
        weight: 20,
      },
      {
        condition: AffinityCondition.Required,
        expressions: [baseExpr],
        id: 'podanti-req',
        topologyKey: 'kubernetes.io/hostname',
        type: AffinityType.PodAnti,
      },
      {
        condition: AffinityCondition.Preferred,
        expressions: [{ ...baseExpr, key: 'podanti-pref' }],
        id: 'podanti-pref',
        topologyKey: 'topology.kubernetes.io/zone',
        type: AffinityType.PodAnti,
        weight: 15,
      },
    ]);

    expect(affinity?.nodeAffinity).toEqual({
      preferredDuringSchedulingIgnoredDuringExecution: [expect.objectContaining({ weight: 30 })],
      requiredDuringSchedulingIgnoredDuringExecution: {
        nodeSelectorTerms: [expect.objectContaining({ matchExpressions: expect.any(Array) })],
      },
    });
    expect(affinity?.podAffinity).toEqual({
      preferredDuringSchedulingIgnoredDuringExecution: [expect.objectContaining({ weight: 20 })],
      requiredDuringSchedulingIgnoredDuringExecution: [
        expect.objectContaining({ topologyKey: 'kubernetes.io/hostname' }),
      ],
    });
    expect(affinity?.podAntiAffinity).toEqual({
      preferredDuringSchedulingIgnoredDuringExecution: [expect.objectContaining({ weight: 15 })],
      requiredDuringSchedulingIgnoredDuringExecution: [
        expect.objectContaining({ topologyKey: 'kubernetes.io/hostname' }),
      ],
    });
  });
});
