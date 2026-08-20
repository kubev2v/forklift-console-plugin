import type { FC } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { defaultStorageMapping } from 'src/storageMaps/utils/constants';
import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { validateUpdatedStorageMaps } from '../../../details/utils/utils';
import { useOffloadPlugins } from '../../../hooks/useOffloadPlugins';
import { useStorageVendorProducts } from '../../../hooks/useStorageVendorProducts';
import OffloadStorageIndexedForm from '../OffloadStorageIndexedForm';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(),
  useK8sWatchResource: jest.fn(() => [
    [{ metadata: { name: 'hpe-secret', uid: 'secret-1' } }],
    true,
    undefined,
  ]),
}));
jest.mock('../../../hooks/useOffloadPlugins');
jest.mock('../../../hooks/useStorageVendorProducts');
mockI18n();

const mockUseOffloadPlugins = useOffloadPlugins as jest.MockedFunction<typeof useOffloadPlugins>;
const mockUseStorageVendorProducts = useStorageVendorProducts as jest.MockedFunction<
  typeof useStorageVendorProducts
>;

const Harness: FC = () => {
  const methods = useForm<{ storageMap: StorageMapping[] }>({
    defaultValues: {
      storageMap: [
        {
          ...defaultStorageMapping,
          [StorageMapFieldId.SourceStorage]: { name: 'ds-1' },
          [StorageMapFieldId.TargetStorage]: { name: 'sc-1' },
        },
      ],
    },
    mode: 'onChange',
  });

  useFieldArray({
    control: methods.control,
    name: StorageMapFieldId.StorageMap,
    rules: {
      validate: (values) => validateUpdatedStorageMaps(values),
    },
  });

  const error =
    methods.formState.errors.storageMap?.root?.message ??
    methods.formState.errors.storageMap?.message;

  const updateMapping = (patch: Partial<StorageMapping>): void => {
    const [current] = methods.getValues(StorageMapFieldId.StorageMap);
    methods.setValue(StorageMapFieldId.StorageMap, [{ ...current, ...patch }]);
  };

  return (
    <FormProvider {...methods}>
      <OffloadStorageIndexedForm index={0} sourceProvider={undefined} />
      <button
        data-testid="set-incomplete-csi"
        onClick={() => {
          updateMapping({ [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport });
        }}
        type="button"
      >
        Set CSI
      </button>
      <button
        data-testid="complete-offload"
        onClick={() => {
          updateMapping({
            [StorageMapFieldId.OffloadPlugin]: OffloadPlugin.CsiVolumeImport,
            [StorageMapFieldId.StorageProduct]: 'primera3par',
            [StorageMapFieldId.StorageSecret]: 'hpe-secret',
          });
        }}
        type="button"
      >
        Complete offload
      </button>
      <span data-testid="storage-map-error">{error ?? ''}</span>
      <span data-testid="form-valid">{String(methods.formState.isValid)}</span>
    </FormProvider>
  );
};

describe('OffloadStorageIndexedForm parent validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOffloadPlugins.mockReturnValue({
      error: null,
      loading: false,
      offloadPlugins: [OffloadPlugin.CsiVolumeImport, OffloadPlugin.VSphereXcopyConfig],
    });
    mockUseStorageVendorProducts.mockReturnValue({
      error: null,
      loading: false,
      storageVendorProducts: ['primera3par'],
    });
  });

  it('marks storageMap invalid when only the offload plugin is set', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByTestId('set-incomplete-csi'));

    await waitFor(() => {
      expect(screen.getByTestId('storage-map-error')).toHaveTextContent('must be set');
    });
    expect(screen.getByTestId('form-valid')).toHaveTextContent('false');
  });

  it('clears the parent error when offload fields are completed', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByTestId('set-incomplete-csi'));
    await waitFor(() => {
      expect(screen.getByTestId('storage-map-error')).toHaveTextContent('must be set');
    });

    await user.click(screen.getByTestId('complete-offload'));

    await waitFor(() => {
      expect(screen.getByTestId('storage-map-error')).toHaveTextContent('');
    });
  });
});
