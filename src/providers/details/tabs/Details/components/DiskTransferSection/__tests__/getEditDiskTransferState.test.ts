import { VddkSetupMode } from 'src/providers/utils/constants';

import { getEditDiskTransferState } from '../getEditDiskTransferState';

const base = {
  canCreateTemplate: true,
  canDeleteTemplate: true,
  confirmedDeletion: false,
  copyApplianceEnabled: true,
  createPermissionLoading: false,
  deletePermissionLoading: false,
  initialMethod: VddkSetupMode.CopyAppliance,
  inventoryError: null,
  inventoryLoading: false,
  method: VddkSetupMode.CopyAppliance,
  placement: {
    datastore: 'datastore',
    folder: '/folder',
    network: 'network',
    resourcePool: '/pool',
  },
  t: (key: string): string => key,
  templateExists: false,
  templateLookupUnavailable: false,
  vddkImage: '',
};

describe('getEditDiskTransferState', () => {
  it('allows an appliance choice when placement and inventory are ready', () => {
    expect(getEditDiskTransferState(base).canSubmit).toBe(true);
  });

  it('blocks appliance setup when inventory fails or feature is disabled', () => {
    expect(
      getEditDiskTransferState({ ...base, inventoryError: new Error('inventory unavailable') })
        .canSubmit,
    ).toBe(false);
    expect(getEditDiskTransferState({ ...base, copyApplianceEnabled: false }).canSubmit).toBe(
      false,
    );
  });

  it('requires deletion permission and explicit confirmation when leaving appliance', () => {
    const leaving = {
      ...base,
      method: VddkSetupMode.Manual,
      templateExists: true,
      vddkImage: 'quay.io/vddk:latest',
    };
    expect(getEditDiskTransferState(leaving).canSubmit).toBe(false);
    expect(getEditDiskTransferState({ ...leaving, confirmedDeletion: true }).canSubmit).toBe(true);
    expect(
      getEditDiskTransferState({
        ...leaving,
        canDeleteTemplate: false,
        confirmedDeletion: true,
      }).canSubmit,
    ).toBe(false);
  });

  it('requires a valid VDDK image for URL and upload choices', () => {
    const state = getEditDiskTransferState({
      ...base,
      method: VddkSetupMode.Upload,
      vddkImage: '',
    });
    expect(state.canSubmit).toBe(false);
    expect(state.imageError).toBeDefined();
  });

  it('keeps VDDK editing available while template permissions and lookup fail', () => {
    const state = getEditDiskTransferState({
      ...base,
      createPermissionLoading: true,
      deletePermissionLoading: true,
      initialMethod: VddkSetupMode.Manual,
      method: VddkSetupMode.Manual,
      templateLookupUnavailable: true,
      vddkImage: 'quay.io/vddk:latest',
    });

    expect(state.canSubmit).toBe(true);
  });

  it('blocks appliance or Skip changes when template existence cannot be checked', () => {
    const state = getEditDiskTransferState({
      ...base,
      canCreateTemplate: false,
      templateLookupUnavailable: true,
    });
    expect(state).toMatchObject({
      canSubmit: false,
      templateError:
        'Unable to check whether a sourcing appliance template exists. Verify that CopyApplianceTemplate resources are available and readable, then try again.',
    });
    expect(state.permissionError).toBeUndefined();
    expect(
      getEditDiskTransferState({
        ...base,
        method: VddkSetupMode.Skip,
        templateLookupUnavailable: true,
      }).canSubmit,
    ).toBe(false);
  });

  it('blocks switching from appliance to VDDK until the template can be checked', () => {
    const state = getEditDiskTransferState({
      ...base,
      method: VddkSetupMode.Manual,
      templateLookupUnavailable: true,
      vddkImage: 'quay.io/vddk:latest',
    });

    expect(state.canSubmit).toBe(false);
  });
});
