import { useEffect, useState } from 'react';

import { act, renderHook } from '@testing-library/react';

import { useCopyApplianceTemplateAccess } from '../useCopyApplianceTemplateAccess';

import { provider } from './useEditDiskTransfer.fixtures';

type Operation = 'create' | 'delete';
const mockResolve: Partial<Record<Operation, (allowed: boolean) => void>> = {};
const mockUseAccessReview = ({ verb }: { verb: Operation }): [boolean, boolean] => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    mockResolve[verb] = (result): void => {
      setAllowed(result);
      setLoading(false);
    };
  }, [verb]);
  return [allowed, loading];
};

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useAccessReview: (options: { verb: Operation }): [boolean, boolean] =>
    mockUseAccessReview(options),
}));
jest.mock('@utils/i18n', () => ({
  t: (key: string): string => key,
  useForkliftTranslation: (): unknown => ({ t: (key: string): string => key }),
}));

it('keeps deletion denied when a slower create permission request succeeds after switching modes', async () => {
  const { result, rerender } = renderHook(
    ({ operation }: { operation: Operation }) =>
      useCopyApplianceTemplateAccess(provider, operation),
    { initialProps: { operation: 'create' as Operation } },
  );
  rerender({ operation: 'delete' });
  expect(result.current.loading).toBe(true);
  await act(async () => {
    mockResolve.delete?.(false);
    await Promise.resolve();
  });
  expect(result.current).toEqual({
    loading: false,
    permissionError: 'You do not have permission to delete the copy appliance template.',
  });
  await act(async () => {
    mockResolve.create?.(true);
    await Promise.resolve();
  });
  expect(result.current.permissionError).toBe(
    'You do not have permission to delete the copy appliance template.',
  );
  rerender({ operation: 'create' });
  expect(result.current).toEqual({ loading: false });
});
