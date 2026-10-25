import type { FC } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CreateProviderPlacementStep from '../CreateProviderPlacementStep';
import { useCreateProviderPlacement } from '../hooks/useCreateProviderPlacement';

const provider = {
  metadata: { name: 'source', namespace: 'mtv', uid: 'provider-uid' },
  spec: { type: 'vsphere' },
  status: { phase: 'Ready' },
} as V1beta1Provider;
const mockConsoleFetchJSON = jest.fn((url: string): Promise<unknown> => {
  if (url.includes('resourcepools')) {
    return Promise.reject(new Error('404 Not Found'));
  }
  return Promise.resolve([]);
});

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  consoleFetchJSON: (url: string): Promise<unknown> => mockConsoleFetchJSON(url),
}));
jest.mock('@utils/hooks/useK8sWatchResource', (): unknown => ({
  useK8sWatchResource: (): [V1beta1Provider, boolean, null] => [provider, true, null],
}));
jest.mock('src/utils/i18n', (): unknown => ({
  useForkliftTranslation: (): unknown => ({ t: (key: string): string => key }),
}));

const PlacementHarness: FC = () => (
  <CreateProviderPlacementStep placement={useCreateProviderPlacement(provider)} />
);

describe('CreateProviderPlacementStep inventory retry', () => {
  beforeEach(() => {
    mockConsoleFetchJSON.mockClear();
  });

  it('reissues a failed inventory endpoint when Retry is clicked', async () => {
    render(<PlacementHarness />);

    await screen.findByText(/Resource pool \(resourcepools\?detail=1\): 404 Not Found/);
    const poolRequests = (): number =>
      mockConsoleFetchJSON.mock.calls.filter(([url]: [string]) =>
        url.includes('resourcepools?detail=1'),
      ).length;
    expect(poolRequests()).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(poolRequests()).toBe(2);
    });
    expect(
      await screen.findByText(/Resource pool \(resourcepools\?detail=1\): 404 Not Found/),
    ).toBeInTheDocument();
  });
});
