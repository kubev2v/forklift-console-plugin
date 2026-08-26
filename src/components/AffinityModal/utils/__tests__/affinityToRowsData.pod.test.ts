import { affinityToRowsData } from '../affinityToRowsData';
import { AffinityCondition, AffinityType } from '../types';

import { podAffinity, podAntiAffinity } from './affinityToRowsData.fixtures';

describe('affinityToRowsData - pod', () => {
  it('maps required and preferred pod affinity terms', () => {
    const rows = affinityToRowsData(podAffinity);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      condition: AffinityCondition.Required,
      id: 'pod-required-0',
      namespaces: ['ns-a'],
      topologyKey: 'kubernetes.io/hostname',
      type: AffinityType.Pod,
    });
    expect(rows[0].expressions).toEqual([{ id: 0, key: 'app', operator: 'In', values: ['api'] }]);
    expect(rows[1]).toMatchObject({
      condition: AffinityCondition.Preferred,
      id: 'pod-preferred-0',
      topologyKey: 'topology.kubernetes.io/zone',
      type: AffinityType.Pod,
      weight: 10,
    });
  });

  it('maps pod anti-affinity with anti ids', () => {
    const rows = affinityToRowsData(podAntiAffinity);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      condition: AffinityCondition.Required,
      id: 'pod-anti-required-0',
      topologyKey: 'kubernetes.io/hostname',
      type: AffinityType.PodAnti,
    });
  });

  it('combines node, pod, and pod anti affinity rows', () => {
    const rows = affinityToRowsData({
      nodeAffinity: {
        requiredDuringSchedulingIgnoredDuringExecution: {
          nodeSelectorTerms: [{ matchExpressions: [] }],
        },
      },
      podAffinity: {
        preferredDuringSchedulingIgnoredDuringExecution: [
          {
            podAffinityTerm: { topologyKey: 'zone' },
            weight: 1,
          },
        ],
      },
      podAntiAffinity: {
        requiredDuringSchedulingIgnoredDuringExecution: [{ topologyKey: 'hostname' }],
      },
    });

    expect(rows.map((row) => row.id)).toEqual([
      'node-required-0',
      'pod-preferred-0',
      'pod-anti-required-0',
    ]);
  });

  it('handles missing labelSelector on pod terms', () => {
    const rows = affinityToRowsData({
      podAffinity: {
        requiredDuringSchedulingIgnoredDuringExecution: [{ topologyKey: 'host' }],
      },
    });

    expect(rows[0].expressions).toBeUndefined();
    expect(rows[0].topologyKey).toBe('host');
  });
});
