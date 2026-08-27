import type { K8sIoApiCoreV1Affinity } from '@forklift-ui/types';

import { AffinityCondition, AffinityType } from '../types';

export const emptyAffinity: K8sIoApiCoreV1Affinity = {};

export const nodeRequiredAffinity: K8sIoApiCoreV1Affinity = {
  nodeAffinity: {
    requiredDuringSchedulingIgnoredDuringExecution: {
      nodeSelectorTerms: [
        {
          matchExpressions: [
            { key: 'zone', operator: 'In', values: ['east'] },
            { key: 'disk', operator: 'Exists', values: undefined },
          ],
          matchFields: [{ key: 'metadata.name', operator: 'In', values: ['node-1'] }],
        },
      ],
    },
  },
};

export const nodePreferredAffinity: K8sIoApiCoreV1Affinity = {
  nodeAffinity: {
    preferredDuringSchedulingIgnoredDuringExecution: [
      {
        preference: {
          matchExpressions: [
            { key: 'tier', operator: 'NotIn', values: ['dev'] },
            { key: 'ssd', operator: 'Exists', values: undefined },
          ],
          matchFields: undefined,
        },
        weight: 50,
      },
    ],
  },
};

export const podAffinity: K8sIoApiCoreV1Affinity = {
  podAffinity: {
    preferredDuringSchedulingIgnoredDuringExecution: [
      {
        podAffinityTerm: {
          labelSelector: {
            matchExpressions: [{ key: 'app', operator: 'Exists' }],
          },
          topologyKey: 'topology.kubernetes.io/zone',
        },
        weight: 10,
      },
    ],
    requiredDuringSchedulingIgnoredDuringExecution: [
      {
        labelSelector: {
          matchExpressions: [{ key: 'app', operator: 'In', values: ['api'] }],
        },
        namespaces: ['ns-a'],
        topologyKey: 'kubernetes.io/hostname',
      },
    ],
  },
};

export const podAntiAffinity: K8sIoApiCoreV1Affinity = {
  podAntiAffinity: {
    preferredDuringSchedulingIgnoredDuringExecution: [
      {
        podAffinityTerm: {
          labelSelector: {
            matchExpressions: [{ key: 'tier', operator: 'Exists' }],
          },
          topologyKey: 'topology.kubernetes.io/zone',
        },
        weight: 20,
      },
    ],
    requiredDuringSchedulingIgnoredDuringExecution: [
      {
        labelSelector: {
          matchExpressions: [{ key: 'role', operator: 'In', values: ['db'] }],
        },
        topologyKey: 'kubernetes.io/hostname',
      },
    ],
  },
};

export const expectedNodeRequiredRow = {
  condition: AffinityCondition.Required,
  id: 'node-required-0',
  type: AffinityType.Node,
};
