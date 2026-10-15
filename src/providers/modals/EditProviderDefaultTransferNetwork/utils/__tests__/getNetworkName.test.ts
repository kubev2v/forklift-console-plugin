import { getNetworkName } from '../getNetworkName';

describe('getNetworkName', () => {
  it('uses the default label for an empty value', () => {
    expect(getNetworkName('')).toBe('Default network');
  });

  it('preserves a configured network name', () => {
    expect(getNetworkName('Network A')).toBe('Network A');
  });
});
