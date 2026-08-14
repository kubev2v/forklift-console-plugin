import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageMapFieldId } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import GroupedSourceStorageField from '../GroupedSourceStorageField';

mockI18n();

const usedSourceStorages: MappingValue[] = [{ id: 'eco-iscsi-ds3', name: 'eco-iscsi-ds3' }];
const otherSourceStorages: MappingValue[] = [{ id: 'eco-iscsi-ds1', name: 'eco-iscsi-ds1' }];

describe('GroupedSourceStorageField', () => {
  it('keeps an already-mapped used source storage selectable for another mapping row', async () => {
    const user = userEvent.setup();

    renderWithForm(
      <GroupedSourceStorageField
        fieldId={`${StorageMapFieldId.StorageMap}.1.sourceStorage`}
        otherSourceStorages={otherSourceStorages}
        usedSourceStorages={usedSourceStorages}
      />,
      {
        defaultValues: {
          [StorageMapFieldId.StorageMap]: [
            {
              [StorageMapFieldId.SourceStorage]: usedSourceStorages[0],
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

    // Grouped select renders one listbox per SelectGroup (used VMs + other).
    const [usedStoragesListbox] = screen.getAllByRole('listbox');
    const reusedSourceOption = within(usedStoragesListbox).getByRole('option', {
      name: 'eco-iscsi-ds3',
    });

    expect(reusedSourceOption).toBeEnabled();
    expect(reusedSourceOption).not.toHaveAttribute('aria-disabled', 'true');
  });
});
