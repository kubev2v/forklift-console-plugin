import { OVirtVM, V1beta1Provider } from '@kubev2v/types';

import { VmData } from '../../details';

/**
 * (oVirt only) Special case of unmapped networks. If the profile is missing then NIC cannot be linked with any oVirt network.
 * This prevents mapping from oVirt network to the target network.
 * @example
 *  {
        "id": "4619ac8a-165b-4ad2-90e4-89b356f423be",
        "name": "nic3",
        "interface": "virtio",
        "plugged": true,
        "ipAddress": null,
        "profile": "",
        "mac": "00:1a:4a:16:01:3f"
    },
    @link https://github.com/kubev2v/forklift/blob/3673837fdedd0ab92df11bce00c31f116abbc126/pkg/controller/plan/validation.go#L331
    @link https://github.com/kubev2v/forklift/blob/3673837fdedd0ab92df11bce00c31f116abbc126/pkg/controller/plan/adapter/ovirt/validator.go#L50
 */
export const hasNicWithEmptyProfile = (
  sourceProvider: V1beta1Provider,
  selectedVms: VmData[],
): boolean => {
  if (sourceProvider.spec?.type !== 'ovirt') {
    return false;
  }

  return selectedVms
    .map(({ vm }): OVirtVM => vm.providerType === 'ovirt' && vm)
    .filter(Boolean)
    .some(({ nics }) => nics.some(({ profile }) => !profile));
};
