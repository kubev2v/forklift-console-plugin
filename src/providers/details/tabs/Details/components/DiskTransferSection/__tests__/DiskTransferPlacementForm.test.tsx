import type { ReactElement } from 'react';

import { render, screen } from '@testing-library/react';

jest.mock('src/utils/i18n', (): unknown => ({
  t: (key: string): string => key,
  useForkliftTranslation: () => ({
    t: (key: string, values?: Record<string, string>): string =>
      Object.entries(values ?? {}).reduce(
        (message, [name, value]) => message.replace(`{{${name}}}`, value),
        key,
      ),
  }),
}));
jest.mock('../../DetailsSection/CopyAppliancePlacementForm', (): unknown => ({
  __esModule: true,
  default: (): ReactElement => <div>Placement fields</div>,
}));
jest.mock('../../DetailsSection/useCopyAppliancePlacementLabels', (): unknown => ({
  useCopyAppliancePlacementLabels: () => ({
    datastore: { label: 'Datastore' },
    folder: { label: 'Folder' },
    network: { label: 'Network' },
    resourcePool: { label: 'Resource pool' },
  }),
}));

import DiskTransferPlacementForm from '../DiskTransferPlacementForm';

const resourcePoolError = new Error('404 Not Found');
const options = {
  datastoreOptions: [],
  datastoreWarning: (): undefined => undefined,
  folderOptions: [],
  inventoryError: resourcePoolError,
  inventoryErrors: { resourcePool: resourcePoolError },
  inventoryLoading: false,
  networkOptions: [],
  onRetry: jest.fn(),
  resourcePoolOptions: [],
};
const values = { datastore: '', folder: '', network: '', resourcePool: '' };

it('combines field-specific inventory and template lookup failures in one alert', () => {
  render(
    <DiskTransferPlacementForm
      onChange={jest.fn()}
      options={options}
      permissionError="You do not have permission to create a copy appliance template."
      templateError="Unable to check whether a sourcing appliance template exists."
      values={values}
    />,
  );

  expect(screen.getAllByTestId('disk-transfer-setup-error')).toHaveLength(1);
  expect(screen.getByText('Unable to load vSphere placement inventory')).toBeVisible();
  const alert = screen.getByTestId('disk-transfer-setup-error');
  expect(alert).toHaveTextContent('Resource pool: 404 Not Found');
  expect(alert).toHaveTextContent('Unable to check whether a sourcing appliance template exists.');
  expect(alert).toHaveTextContent(
    'You do not have permission to create a copy appliance template.',
  );
});
