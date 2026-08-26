import { describe, expect, it } from '@jest/globals';
import { DEFAULT_NETWORK } from '@utils/constants';
import { NetworkMapFieldId } from '@utils/crds/maps/types';

import { validateNetworkMaps } from '../utils';

const mapping = (source: string, target: string) =>
  ({
    [NetworkMapFieldId.SourceNetwork]: { name: source },
    [NetworkMapFieldId.TargetNetwork]: { name: target },
  }) as never;

describe('validateNetworkMaps - validation', () => {
  it('requires at least one mapping', () => {
    expect(validateNetworkMaps([])).toMatch(/At least one network mapping/i);
  });

  it('requires source and target names', () => {
    expect(validateNetworkMaps([mapping('', 't')])).toMatch(/Source network is required/i);
    expect(validateNetworkMaps([mapping('s', '')])).toMatch(/Target network is required/i);
  });

  it('allows only one default network target', () => {
    expect(
      validateNetworkMaps([mapping('s1', DEFAULT_NETWORK), mapping('s2', DEFAULT_NETWORK)]),
    ).toMatch(/Only one mapping can target the default network/i);
  });

  it('accepts valid mappings', () => {
    expect(validateNetworkMaps([mapping('s', 't')])).toBeUndefined();
  });
});
