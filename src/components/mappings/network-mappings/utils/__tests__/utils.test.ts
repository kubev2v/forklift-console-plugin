import { isSameSourceNetwork } from '../utils';

describe('isSameSourceNetwork', () => {
  it('matches entries with same id and no vlan', () => {
    expect(isSameSourceNetwork({ id: 'net-1', name: 'Net' }, { id: 'net-1', name: 'Net' })).toBe(
      true,
    );
  });

  it('does not match entries with different ids', () => {
    expect(isSameSourceNetwork({ id: 'net-1', name: 'Net' }, { id: 'net-2', name: 'Net' })).toBe(
      false,
    );
  });

  it('matches entries with same id and same vlan', () => {
    expect(
      isSameSourceNetwork(
        { id: 'net-1', name: 'Net (VLAN 100)', vlan: '100' },
        { id: 'net-1', name: 'Net (VLAN 100)', vlan: '100' },
      ),
    ).toBe(true);
  });

  it('does not match entries with same id but different vlans', () => {
    expect(
      isSameSourceNetwork(
        { id: 'net-1', name: 'Net (VLAN 100)', vlan: '100' },
        { id: 'net-1', name: 'Net (VLAN 200)', vlan: '200' },
      ),
    ).toBe(false);
  });

  it('does not match a vlan entry with a plain entry sharing same id', () => {
    expect(
      isSameSourceNetwork(
        { id: 'net-1', name: 'Net (VLAN 100)', vlan: '100' },
        { id: 'net-1', name: 'Net' },
      ),
    ).toBe(false);
  });

  it('does not match a plain entry with a vlan entry sharing same id', () => {
    expect(
      isSameSourceNetwork(
        { id: 'net-1', name: 'Net' },
        { id: 'net-1', name: 'Net (VLAN 100)', vlan: '100' },
      ),
    ).toBe(false);
  });
});
