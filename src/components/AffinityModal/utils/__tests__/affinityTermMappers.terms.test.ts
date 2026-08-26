jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  Operator: {
    DoesNotExist: 'DoesNotExist',
    Exists: 'Exists',
    In: 'In',
    NotIn: 'NotIn',
  },
}));

import {
  getPreferredNodeTermFromRowData,
  getPreferredPodTermFromRowData,
  getRequiredNodeTermFromRowData,
  getRequiredPodTermFromRowData,
} from '../affinityTermMappers';
import { AffinityCondition, type AffinityLabel, type AffinityRowData, AffinityType } from '../types';

const label = (overrides: Partial<AffinityLabel> = {}): AffinityLabel => ({
  id: 0,
  key: 'app',
  operator: 'In',
  values: ['api'],
  ...overrides,
});

const row = (overrides: Partial<AffinityRowData> = {}): AffinityRowData => ({
  condition: AffinityCondition.Required,
  expressions: [label()],
  fields: [label({ id: 1, key: 'metadata.name', values: ['n1'] })],
  id: '1',
  topologyKey: 'kubernetes.io/hostname',
  type: AffinityType.Node,
  weight: 25,
  ...overrides,
});

describe('affinityTermMappers - terms', () => {
  it('maps required node terms and strips label ids', () => {
    expect(getRequiredNodeTermFromRowData(row())).toEqual({
      matchExpressions: [{ key: 'app', operator: 'In', values: ['api'] }],
      matchFields: [{ key: 'metadata.name', operator: 'In', values: ['n1'] }],
    });
  });

  it('clears values for Exists and DoesNotExist operators', () => {
    const existsRow = row({
      expressions: [label({ operator: 'Exists', values: ['ignored'] })],
      fields: [label({ id: 1, key: 'field', operator: 'DoesNotExist', values: ['x'] })],
    });

    expect(getRequiredNodeTermFromRowData(existsRow)).toEqual({
      matchExpressions: [{ key: 'app', operator: 'Exists', values: [] }],
      matchFields: [{ key: 'field', operator: 'DoesNotExist', values: [] }],
    });
  });

  it('returns empty arrays when expressions and fields are undefined', () => {
    expect(
      getRequiredNodeTermFromRowData(row({ expressions: undefined, fields: undefined })),
    ).toEqual({ matchExpressions: [], matchFields: [] });
  });

  it('maps preferred node terms with weight', () => {
    expect(getPreferredNodeTermFromRowData(row({ weight: 40 }))).toEqual({
      preference: {
        matchExpressions: [{ key: 'app', operator: 'In', values: ['api'] }],
        matchFields: [{ key: 'metadata.name', operator: 'In', values: ['n1'] }],
      },
      weight: 40,
    });
  });

  it('maps required and preferred pod terms', () => {
    expect(getRequiredPodTermFromRowData(row({ type: AffinityType.Pod }))).toEqual({
      labelSelector: {
        matchExpressions: [{ key: 'app', operator: 'In', values: ['api'] }],
      },
      topologyKey: 'kubernetes.io/hostname',
    });

    expect(
      getPreferredPodTermFromRowData(
        row({ type: AffinityType.Pod, weight: 15 }) as AffinityRowData & {
          topologyKey: string;
          weight: number;
        },
      ),
    ).toEqual({
      podAffinityTerm: {
        labelSelector: {
          matchExpressions: [{ key: 'app', operator: 'In', values: ['api'] }],
        },
        topologyKey: 'kubernetes.io/hostname',
      },
      weight: 15,
    });
  });
});
