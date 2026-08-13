import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageMapFieldId } from '@utils/storage/types';
import type { MappingValue } from '@utils/types';

import SourceStorageField from '../SourceStorageField';

mockI18n();

const sourceStorages: MappingValue[] = [
  { id: 'eco-iscsi-ds3', name: 'eco-iscsi-ds3' },
  { id: 'eco-iscsi-ds1', name: 'eco-iscsi-ds1' },
];

describe('SourceStorageField', () => {
  it('keeps an already-mapped source storage selectable for another mapping row', async () => {
    const user = userEvent.setup();

    renderWithForm(
      <SourceStorageField
        fieldId={`${StorageMapFieldId.StorageMap}.1.sourceStorage`}
        sourceStorages={sourceStorages}
      />,
      {
        defaultValues: {
          [StorageMapFieldId.StorageMap]: [
            {
              [StorageMapFieldId.SourceStorage]: sourceStorages[0],
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
