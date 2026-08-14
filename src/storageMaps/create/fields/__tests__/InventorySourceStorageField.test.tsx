import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InventoryStorage } from '@utils/hooks/useStorages';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { StorageMapFieldId } from '@utils/storage/types';

import InventorySourceStorageField from '../InventorySourceStorageField';

mockI18n();

const createVSphereStorage = (
  id: string,
  name: string,
): Extract<InventoryStorage, { providerType: 'vsphere' }> => ({
  backingDevicesNames: [],
  capacity: 0,
  free: 0,
  id,
  maintenance: '',
  name,
  parent: { id: 'datacenter-1', kind: 'Datacenter' },
  path: `/${name}`,
  providerType: PROVIDER_TYPES.vsphere,
  revision: 1,
  selfLink: `/providers/vsphere/uid/datastores/${id}`,
  type: 'VMFS',
});

const sourceStorages = [
  createVSphereStorage('eco-iscsi-ds3', 'eco-iscsi-ds3'),
  createVSphereStorage('eco-iscsi-ds1', 'eco-iscsi-ds1'),
] satisfies InventoryStorage[];

describe('InventorySourceStorageField', () => {
  it('keeps an already-mapped source storage selectable for another mapping row', async () => {
    const user = userEvent.setup();

    renderWithForm(
      <InventorySourceStorageField
        fieldId={`${StorageMapFieldId.StorageMap}.1.sourceStorage`}
        sourceStorages={sourceStorages}
      />,
      {
        defaultValues: {
          [StorageMapFieldId.StorageMap]: [
            {
              [StorageMapFieldId.SourceStorage]: {
                id: sourceStorages[0].id,
                name: sourceStorages[0].name,
              },
              [StorageMapFieldId.TargetStorage]: {
                id: 'hpe-3par-iscsi-block',
                name: 'hpe-3par-iscsi-block',
              },
            },
            {
              [StorageMapFieldId.SourceStorage]: { id: '', name: '' },
              [StorageMapFieldId.TargetStorage]: { id: '', name: '' },
            },
          ],
        },
      },
    );

    await user.click(screen.getByRole('button', { name: 'Select menu toggle' }));

    const listbox = screen.getByRole('listbox');
    const reusedSourceOption = within(listbox).getByRole('option', { name: 'eco-iscsi-ds3' });

    expect(reusedSourceOption).toBeEnabled();
    expect(reusedSourceOption).not.toHaveAttribute('aria-disabled', 'true');
  });
});
