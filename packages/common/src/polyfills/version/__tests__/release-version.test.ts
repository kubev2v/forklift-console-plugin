import { getReleaseVersionSemanticVersioning } from '../release-version';

describe('getReleaseVersionSemanticVersioning', () => {
  it('calculate semantic version currectly', () => {
    expect(getReleaseVersionSemanticVersioning('1.2.3', '')).toEqual([1,2,3]);
  });

  it('fall back currectly on empty string', () => {
    expect(getReleaseVersionSemanticVersioning('', '')).toEqual([0,0,0]);
  });

  it('fall back currectly on undefined', () => {
    expect(getReleaseVersionSemanticVersioning(undefined, '')).toEqual([0,0,0]);
  });

  it('fall back currectly on numberic input', () => {
    expect(getReleaseVersionSemanticVersioning(123, '')).toEqual([0,0,0]);
  });

  it('fall back currectly on garbage', () => {
    expect(getReleaseVersionSemanticVersioning('just some words', '')).toEqual([0,0,0]);
  });

  it('fall back currectly on none a.b.c version', () => {
    expect(getReleaseVersionSemanticVersioning('1.2.3-beta', '')).toEqual([1,2,3]);
  });

  it('fall back currectly on old git versions', () => {
    expect(getReleaseVersionSemanticVersioning('', 'v6.0.6-20465-gf354c93297')).toEqual([-1,0,0]);
  });

  it('fall back currectly on new git versions', () => {
    expect(getReleaseVersionSemanticVersioning('', 'v6.0.6-21316-g106dab445e')).toEqual([0,0,0]);
  });
});
