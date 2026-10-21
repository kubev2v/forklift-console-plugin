import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';

import { getDiskTransferMethod } from '../getDiskTransferMethod';

const providerWith = (image?: string, marker?: string): V1beta1Provider =>
  ({
    metadata: { annotations: marker ? { [DISK_TRANSFER_METHOD_ANNOTATION]: marker } : undefined },
    spec: { settings: image ? { vddkInitImage: image } : {} },
  }) as V1beta1Provider;

describe('getDiskTransferMethod', () => {
  it('prefills an existing VDDK image as URL method even when a template exists', () => {
    expect(
      getDiskTransferMethod(providerWith('quay.io/vddk:latest', VddkSetupMode.CopyAppliance), true),
    ).toBe(VddkSetupMode.Manual);
  });

  it('selects an existing template when no VDDK image exists', () => {
    expect(getDiskTransferMethod(providerWith(undefined, VddkSetupMode.Skip), true)).toBe(
      VddkSetupMode.CopyAppliance,
    );
  });

  it('retains a pending appliance choice when the template is absent', () => {
    expect(getDiskTransferMethod(providerWith(undefined, VddkSetupMode.CopyAppliance), false)).toBe(
      VddkSetupMode.CopyAppliance,
    );
  });

  it('treats no image, template, or appliance marker as skip', () => {
    expect(getDiskTransferMethod(providerWith(), false)).toBe(VddkSetupMode.Skip);
  });
});
