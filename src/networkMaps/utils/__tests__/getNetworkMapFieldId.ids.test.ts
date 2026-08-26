import { describe, expect, it } from '@jest/globals';
import { NetworkMapFieldId } from '@utils/crds/maps/types';

import { getNetworkMapFieldId } from '../getNetworkMapFieldId';

describe('getNetworkMapFieldId - ids', () => {
  it('builds nested network map field ids', () => {
    expect(getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, 2)).toBe(
      `${NetworkMapFieldId.NetworkMap}.2.${NetworkMapFieldId.SourceNetwork}`,
    );
  });
});
