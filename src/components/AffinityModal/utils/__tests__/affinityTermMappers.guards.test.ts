jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  Operator: {
    DoesNotExist: 'DoesNotExist',
    Exists: 'Exists',
    In: 'In',
    NotIn: 'NotIn',
  },
}));

import { hasTopologyKey, hasValidWeight, hasWeightAndTopologyKey } from '../affinityTermMappers';
import { AffinityCondition, type AffinityRowData, AffinityType } from '../types';

const baseRow = (overrides: Partial<AffinityRowData> = {}): AffinityRowData => ({
  condition: AffinityCondition.Preferred,
  id: '1',
  type: AffinityType.Pod,
  ...overrides,
});

describe('affinityTermMappers - guards', () => {
  describe('hasValidWeight', () => {
    it.each([
      [1, true],
      [100, true],
      [50, true],
      [0, false],
      [101, false],
      [1.5, false],
      [-1, false],
      [Number.NaN, false],
      [undefined, false],
    ])('weight %p → %p', (weight, expected) => {
      expect(hasValidWeight(baseRow({ weight }))).toBe(expected);
    });
  });

  describe('hasTopologyKey', () => {
    it('returns true for non-empty topology key', () => {
      expect(hasTopologyKey(baseRow({ topologyKey: 'kubernetes.io/hostname' }))).toBe(true);
    });

    it('returns false for empty, whitespace, or missing topology key', () => {
      expect(hasTopologyKey(baseRow({ topologyKey: '' }))).toBe(false);
      expect(hasTopologyKey(baseRow({ topologyKey: '   ' }))).toBe(false);
      expect(hasTopologyKey(baseRow({ topologyKey: undefined }))).toBe(false);
    });
  });

  describe('hasWeightAndTopologyKey', () => {
    it('requires both valid weight and topology key', () => {
      expect(hasWeightAndTopologyKey(baseRow({ topologyKey: 'zone', weight: 10 }))).toBe(true);
      expect(hasWeightAndTopologyKey(baseRow({ topologyKey: 'zone', weight: 0 }))).toBe(false);
      expect(hasWeightAndTopologyKey(baseRow({ topologyKey: '', weight: 10 }))).toBe(false);
    });
  });
});
