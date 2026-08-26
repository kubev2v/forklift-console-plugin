import type { V1beta1Provider } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

import { useCreateDeepInspections } from '../useCreateDeepInspections';

jest.mock('../../utils/createDeepInspections', () => ({
  processDeepInspections: jest.fn(() => Promise.resolve({ failed: [], succeeded: [] })),
}));

import { processDeepInspections } from '../../utils/createDeepInspections';

const provider = { metadata: { name: 'p' } } as unknown as V1beta1Provider;

describe('useCreateDeepInspections', () => {
  it('returns a callback that delegates to processDeepInspections', async () => {
    const { result } = renderHook(() => useCreateDeepInspections({ provider }));

    await expect(result.current([{ id: '1', name: 'vm' }])).resolves.toEqual({
      failed: [],
      succeeded: [],
    });
    expect(processDeepInspections).toHaveBeenCalledWith(
      [{ id: '1', name: 'vm' }],
      provider,
      undefined,
    );
  });

  it('passes plan through when provided', async () => {
    const plan = { metadata: { name: 'plan' } } as never;
    const { result } = renderHook(() => useCreateDeepInspections({ plan, provider }));

    await result.current([]);
    expect(processDeepInspections).toHaveBeenCalledWith([], provider, plan);
  });
});
