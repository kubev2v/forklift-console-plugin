import type { FC, ReactElement } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import { render, screen } from '@testing-library/react';

import CreateProviderPlacementStep from '../CreateProviderPlacementStep';
import { useCreateProviderPlacement } from '../hooks/useCreateProviderPlacement';

const createdProvider = {
  metadata: { name: 'source', namespace: 'mtv', uid: 'provider-uid' },
  spec: { type: 'vsphere' },
} as V1beta1Provider;
let mockWatchResult: [V1beta1Provider | undefined, boolean, Error | null];

jest.mock('@utils/hooks/useK8sWatchResource', (): unknown => ({
  useK8sWatchResource: (): typeof mockWatchResult => mockWatchResult,
}));
jest.mock('src/utils/i18n', (): unknown => ({
  useForkliftTranslation: (): unknown => ({ t: (key: string): string => key }),
}));
jest.mock('../CreateProviderPlacementInventory', (): unknown => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="placement-fields" />,
}));

jest.mock(
  'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementOptions',
  () => ({
    useCopyAppliancePlacementOptions: (): object => ({ inventoryLoading: true }),
  }),
);

const PlacementHarness: FC = () => (
  <CreateProviderPlacementStep placement={useCreateProviderPlacement(createdProvider)} />
);
const renderStep = (): ReturnType<typeof render> => render(<PlacementHarness />);

describe('CreateProviderPlacementStep', () => {
  beforeEach(() => {
    mockWatchResult = [undefined, false, null];
  });

  it('waits for the Provider watch and connection before showing fields', () => {
    const view = renderStep();
    expect(screen.getByText('Creating provider')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Creating provider');
    expect(screen.queryByTestId('placement-fields')).not.toBeInTheDocument();

    mockWatchResult = [{ ...createdProvider, status: { phase: 'Staging' } }, true, null];
    view.rerender(<PlacementHarness />);
    expect(screen.getByText('Connecting to the provider')).toBeInTheDocument();
    expect(screen.queryByTestId('placement-fields')).not.toBeInTheDocument();

    mockWatchResult = [{ ...createdProvider, status: { phase: 'Ready' } }, true, null];
    view.rerender(<PlacementHarness />);
    expect(screen.getByTestId('placement-fields')).toBeInTheDocument();
  });

  it('shows connection failure instead of an inventory error', () => {
    mockWatchResult = [{ ...createdProvider, status: { phase: 'ConnectionFailed' } }, true, null];
    renderStep();

    expect(
      screen.getByText('The provider connection failed. Check its URL and credentials.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('placement-fields')).not.toBeInTheDocument();
  });

  it('shows a Provider watch error without mounting inventory', () => {
    mockWatchResult = [undefined, false, new Error('API unavailable')];
    renderStep();

    expect(screen.getByText('API unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('placement-fields')).not.toBeInTheDocument();
  });
});
