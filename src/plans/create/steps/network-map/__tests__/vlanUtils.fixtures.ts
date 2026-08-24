import { PROVIDER_TYPES } from '@utils/providers/constants';

export const makeHypervVm = (name: string, nics: { networkId: string; vlanId?: number }[]): never =>
  ({
    name,
    providerType: PROVIDER_TYPES.hyperv,
    nics: nics.map((nic, idx) => ({
      name: `nic-${idx}`,
      mac: `00:00:00:00:00:0${idx}`,
      deviceIndex: idx,
      network: { kind: 'Network', id: nic.networkId },
      vlanId: nic.vlanId ?? 0,
    })),
  }) as never;

export const networks = [
  { id: 'net-a', name: 'Lab-External' },
  { id: 'net-b', name: 'Default Switch' },
] as never[];
