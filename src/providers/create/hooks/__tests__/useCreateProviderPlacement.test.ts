import type { V1beta1Provider } from '@forklift-ui/types';
import { act, renderHook } from '@testing-library/react';

import { useCreateProviderPlacement } from '../useCreateProviderPlacement';

const provider = {
  metadata: { name: 'source', namespace: 'mtv', uid: 'provider-uid' },
  status: { phase: 'Ready' },
} as V1beta1Provider;
const values = {
  datastore: 'datastore',
  folder: '/folder',
  network: 'network',
  resourcePool: '/pool',
};
const mockOptions = {
  datastoreOptions: [{ itemId: values.datastore }],
  folderOptions: [{ itemId: values.folder }],
  inventoryError: null as Error | null,
  inventoryLoading: false,
  networkOptions: [{ itemId: values.network }],
  resourcePoolOptions: [{ itemId: values.resourcePool }],
};
let mockWatchResult: [V1beta1Provider, boolean, Error | null];

jest.mock('@utils/hooks/useK8sWatchResource', (): object => ({
  useK8sWatchResource: (): typeof mockWatchResult => mockWatchResult,
}));
jest.mock(
  'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementOptions',
  (): object => ({
    useCopyAppliancePlacementOptions: (): typeof mockOptions => mockOptions,
  }),
);

describe('useCreateProviderPlacement', () => {
  beforeEach(() => {
    mockWatchResult = [provider, true, null];
    mockOptions.inventoryError = null;
    mockOptions.inventoryLoading = false;
    mockOptions.resourcePoolOptions = [{ itemId: values.resourcePool }];
  });

  it('derives deployment validity from the current provider and inventory without a synchronization effect', () => {
    const { result, rerender } = renderHook(() => useCreateProviderPlacement(provider));
    expect(result.current.canDeploy).toBe(false);
    act(() => {
      for (const field of Object.keys(values) as (keyof typeof values)[]) {
        result.current.onChange(field, values[field]);
      }
    });
    expect(result.current.canDeploy).toBe(true);

    mockWatchResult = [{ ...provider, status: { phase: 'ConnectionFailed' } }, true, null];
    rerender();
    expect(result.current.canDeploy).toBe(false);

    mockWatchResult = [provider, true, null];
    mockOptions.inventoryLoading = true;
    rerender();
    expect(result.current.canDeploy).toBe(false);

    mockOptions.inventoryLoading = false;
    mockOptions.resourcePoolOptions = [];
    rerender();
    expect(result.current.canDeploy).toBe(false);
    expect(result.current.values).toEqual(values);
  });
});
