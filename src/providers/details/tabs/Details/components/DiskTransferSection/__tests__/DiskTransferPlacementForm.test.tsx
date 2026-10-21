import { render, screen } from '@testing-library/react';

jest.mock('src/utils/i18n', (): unknown => ({
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
  default: (): React.ReactElement => <div>Placement fields</div>,
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
  resourcePoolEndpointUnavailable: true,
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
  expect(screen.getByText('Resource pool (resourcepools?detail=1): 404 Not Found')).toBeVisible();
  expect(
    screen.getByText(
      'The resource-pool inventory endpoint appears unavailable from this Forklift backend. Retry cannot add this endpoint; use a backend with resource-pool inventory support.',
    ),
  ).toBeVisible();
  expect(
    screen.getByText('Unable to check whether a sourcing appliance template exists.'),
  ).toBeVisible();
  expect(
    screen.getByText('You do not have permission to create a copy appliance template.'),
  ).toBeVisible();
});

it('does not imply backend support is missing for other inventory failures', () => {
  render(
    <DiskTransferPlacementForm
      onChange={jest.fn()}
      options={{ ...options, resourcePoolEndpointUnavailable: false }}
      values={values}
    />,
  );

  expect(screen.getAllByTestId('disk-transfer-setup-error')).toHaveLength(1);
  expect(
    screen.queryByText(
      'The resource-pool inventory endpoint appears unavailable from this Forklift backend. Retry cannot add this endpoint; use a backend with resource-pool inventory support.',
    ),
  ).not.toBeInTheDocument();
});
