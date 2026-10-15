import { describe, expect, it } from '@jest/globals';
import { POD } from '@utils/constants';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { getDefaultNetworkLabel } from '@utils/mappings/constants';

import { validateNetworkMaps } from '../utils';

const mapping = (source: string, target: string | { id: string; name: string }): never =>
  ({
    [NetworkMapFieldId.SourceNetwork]: { name: source },
    [NetworkMapFieldId.TargetNetwork]: typeof target === 'string' ? { name: target } : target,
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
      validateNetworkMaps([
        mapping('s1', getDefaultNetworkLabel()),
        mapping('s2', getDefaultNetworkLabel()),
      ]),
    ).toMatch(/Only one mapping can target the default network/i);
  });

  it('counts stale POD IDs as duplicate default-network targets', () => {
    const staleTarget = { id: POD, name: 'Default network (stale)' };

    expect(validateNetworkMaps([mapping('s1', staleTarget), mapping('s2', staleTarget)])).toMatch(
      /Only one mapping can target the default network/i,
    );
  });

  it('accepts valid mappings', () => {
    expect(validateNetworkMaps([mapping('s', 't')])).toBeUndefined();
  });
});
