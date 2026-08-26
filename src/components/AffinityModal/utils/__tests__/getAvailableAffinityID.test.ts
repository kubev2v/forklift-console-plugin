import { AffinityCondition, type AffinityRowData, AffinityType } from '../types';
import { getAvailableAffinityID } from '../getAvailableAffinityID';

const row = (id: string): AffinityRowData => ({
  condition: AffinityCondition.Required,
  id,
  type: AffinityType.Node,
});

describe('getAvailableAffinityID', () => {
  it('returns "1" when affinities are empty', () => {
    expect(getAvailableAffinityID([])).toBe('1');
  });

  it('returns "1" when existing ids are non-numeric', () => {
    expect(getAvailableAffinityID([row('node-required-0'), row('pod-1')])).toBe('1');
  });

  it('skips ids that are already taken', () => {
    expect(getAvailableAffinityID([row('1'), row('2')])).toBe('3');
  });

  it('fills the first gap in numeric ids', () => {
    expect(getAvailableAffinityID([row('1'), row('3')])).toBe('2');
  });

  it('handles a single taken id of "1"', () => {
    expect(getAvailableAffinityID([row('1')])).toBe('2');
  });
});
