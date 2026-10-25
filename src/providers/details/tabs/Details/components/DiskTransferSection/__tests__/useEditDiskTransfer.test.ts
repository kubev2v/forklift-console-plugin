import { VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { act, renderHook } from '@testing-library/react';

import { createDiskTransferSaveError } from '../diskTransferSaveErrors';
import { useEditDiskTransfer } from '../useEditDiskTransfer';

import { props, provider, template } from './useEditDiskTransfer.fixtures';

let mockEnabled = true;
let mockAllowed = true;
let mockInventoryError: Error | null = null;
const mockSave = jest.fn();
const mockAccess = jest.fn((_options: unknown) => [mockAllowed, false]);

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useAccessReview: (options: unknown): unknown => mockAccess(options),
}));
jest.mock('@utils/hooks/useFeatureFlags', () => ({
  useFeatureFlags: (): unknown => ({ isFeatureEnabled: (): boolean => mockEnabled }),
}));
jest.mock('../../DetailsSection/useCopyAppliancePlacementOptions', () => ({
  useCopyAppliancePlacementOptions: (): unknown => ({
    inventoryError: mockInventoryError,
    inventoryLoading: false,
  }),
}));
jest.mock('../saveDiskTransferSettings', () => ({
  saveDiskTransferSettings: (...args: unknown[]): unknown => mockSave(...args),
}));
jest.mock('@utils/i18n', () => ({
  t: (key: string): string => key,
  useForkliftTranslation: (): unknown => ({ t: (key: string): string => key }),
}));

beforeEach(() => {
  mockEnabled = true;
  mockAllowed = true;
  mockInventoryError = null;
  mockSave.mockReset();
  mockAccess.mockClear();
});

it('requires available inventory, complete placement and enabled copy appliance', () => {
  const { result, rerender } = renderHook(() => useEditDiskTransfer(props));
  expect(result.current.canSubmit).toBe(true);
  act(() => {
    result.current.setValue('placement.folder', '');
  });
  expect(result.current.canSubmit).toBe(false);
  act(() => {
    result.current.setValue('placement.folder', '/folder');
  });
  mockInventoryError = new Error('unavailable');
  rerender();
  expect(result.current.canSubmit).toBe(false);
  mockInventoryError = null;
  mockEnabled = false;
  rerender();
  expect(result.current.permissionError).toBeDefined();
  expect(result.current.canSubmit).toBe(false);
});

it('requires deletion permission and fresh confirmation after changing methods', () => {
  const { result, rerender } = renderHook(() => useEditDiskTransfer({ ...props, template }));
  act(() => {
    result.current.onMethodChange(VddkSetupMode.Skip);
  });
  expect(result.current.canSubmit).toBe(false);
  expect(mockAccess).toHaveBeenLastCalledWith(expect.objectContaining({ verb: 'delete' }));
  act(() => {
    result.current.setValue('confirmedDeletion', true);
  });
  expect(result.current.canSubmit).toBe(true);
  mockAllowed = false;
  rerender();
  expect(result.current.canSubmit).toBe(false);
  mockAllowed = true;
  act(() => {
    result.current.onMethodChange(VddkSetupMode.Manual);
  });
  expect(result.current.values.confirmedDeletion).toBe(false);
});

it('clears an old VDDK image when starting an upload and validates the uploaded image', () => {
  const { result } = renderHook(() => useEditDiskTransfer(props));
  act(() => {
    result.current.setValue('vddkImage', 'quay.io/vddk:latest');
  });
  act(() => {
    result.current.onMethodChange(VddkSetupMode.Upload);
  });
  expect(result.current.values.vddkImage).toBe('');
  expect(result.current.imageError).toBeDefined();
  expect(result.current.canSubmit).toBe(false);
  act(() => {
    result.current.setValue('vddkImage', 'quay.io/vddk:new');
  });
  expect(result.current.canSubmit).toBe(true);
});

it('allows existing VDDK editing during a template outage but blocks appliance transitions', () => {
  const vddkProvider = {
    ...provider,
    spec: { ...provider.spec, settings: { vddkInitImage: 'quay.io/vddk:latest' } },
  } as V1beta1Provider;
  const { result } = renderHook(() =>
    useEditDiskTransfer({ provider: vddkProvider, templateLookupUnavailable: true }),
  );
  expect(result.current.canSubmit).toBe(true);
  act(() => {
    result.current.onMethodChange(VddkSetupMode.CopyAppliance);
  });
  expect(result.current.canSubmit).toBe(false);
  expect(result.current.templateError).toBeDefined();
  expect(result.current.permissionError).toBeUndefined();
  act(() => {
    result.current.onMethodChange(VddkSetupMode.Skip);
  });
  expect(result.current.canSubmit).toBe(false);
});

it('retries a partial deletion failure without deleting the same template again', async () => {
  const { result } = renderHook(() => useEditDiskTransfer({ ...props, template }));
  act(() => {
    result.current.onMethodChange(VddkSetupMode.Skip);
  });
  act(() => {
    result.current.setValue('confirmedDeletion', true);
  });
  const error = createDiskTransferSaveError('conflict', true);
  mockSave.mockRejectedValueOnce(error);
  await act(async () => {
    await expect(result.current.onConfirm()).rejects.toBe(error);
  });
  expect(result.current.requiresDeletion).toBe(false);
  await act(async () => {
    await result.current.onConfirm();
  });
  expect(mockSave).toHaveBeenLastCalledWith(
    provider,
    undefined,
    expect.objectContaining({ method: VddkSetupMode.Skip }),
  );
});
