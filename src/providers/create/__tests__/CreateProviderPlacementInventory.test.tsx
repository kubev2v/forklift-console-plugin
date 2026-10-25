import type { ReactElement } from 'react';
import type { CopyApplianceSettingField } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import type { CopyAppliancePlacementFieldLabels } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementLabels';

import { fireEvent, render, screen } from '@testing-library/react';

import CreateProviderPlacementInventory from '../CreateProviderPlacementInventory';

const option = { children: 'inventory-value', value: 'inventory-value' };
const mockOptions = {
  datastoreOptions: [option],
  datastoreWarning: (): undefined => undefined,
  folderOptions: [option],
  inventoryError: null as Error | null,
  inventoryErrors: {} as Partial<Record<CopyApplianceSettingField, Error>>,
  inventoryLoading: true,
  networkOptions: [option],
  onRetry: jest.fn(),
  resourcePoolOptions: [option],
};

jest.mock(
  'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementLabels',
  (): unknown => ({
    useCopyAppliancePlacementLabels: (): CopyAppliancePlacementFieldLabels => ({
      datastore: { help: '', label: 'Datastore', placeholder: '' },
      folder: { help: '', label: 'Folder', placeholder: '' },
      network: { help: '', label: 'Network', placeholder: '' },
      resourcePool: { help: '', label: 'Resource pool', placeholder: '' },
    }),
  }),
);
jest.mock(
  'src/providers/details/tabs/Details/components/DetailsSection/CopyAppliancePlacementForm',
  (): unknown => ({
    __esModule: true,
    default: (): ReactElement => <div data-testid="placement-fields" />,
  }),
);
jest.mock('src/utils/i18n', (): unknown => ({
  useForkliftTranslation: (): unknown => ({ t: (key: string): string => key }),
}));

const renderInventory = (onRetry = jest.fn()): ReturnType<typeof render> =>
  render(
    <CreateProviderPlacementInventory
      placement={{
        canDeploy: false,
        connection: { error: null, isMissing: false, isReady: true, loaded: true, phase: 'Ready' },
        onChange: jest.fn(),
        options: { ...mockOptions, onRetry },
        values: { datastore: '', folder: '', network: '', resourcePool: '' },
      }}
    />,
  );

describe('CreateProviderPlacementInventory', () => {
  beforeEach(() => {
    mockOptions.inventoryLoading = true;
    mockOptions.inventoryError = null;
    mockOptions.inventoryErrors = {};
    mockOptions.resourcePoolOptions = [option];
  });

  it('hides placement fields while inventory loads', () => {
    renderInventory();

    expect(screen.getByLabelText('Loading vSphere placement inventory')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent(
      'Loading vSphere placement inventory',
    );
    expect(screen.queryByTestId('placement-fields')).not.toBeInTheDocument();
  });

  it('shows fields only after all required inventory options load', () => {
    mockOptions.inventoryLoading = false;
    renderInventory();

    expect(screen.getByTestId('placement-fields')).toBeInTheDocument();
  });

  it('shows a retryable inventory error after loading', () => {
    mockOptions.inventoryLoading = false;
    mockOptions.inventoryError = new Error('Network unavailable');
    mockOptions.inventoryErrors = { resourcePool: new Error('404 Not Found') };
    const onRetry = jest.fn();
    renderInventory(onRetry);

    expect(
      screen.getByText(/Resource pool \(resourcepools\?detail=1\): 404 Not Found/),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('placement-fields')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows fields but prevents deployment when required inventory is empty', () => {
    mockOptions.inventoryLoading = false;
    mockOptions.resourcePoolOptions = [];
    renderInventory();

    expect(screen.getByText(/Required vSphere inventory/)).toBeInTheDocument();
    expect(screen.getByText('Resource pool (resourcepools?detail=1)')).toBeInTheDocument();
    expect(screen.getByTestId('placement-fields')).toBeInTheDocument();
  });
});
