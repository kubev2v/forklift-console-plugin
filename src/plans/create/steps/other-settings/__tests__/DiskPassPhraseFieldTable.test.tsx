import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { OtherSettingsFormFieldId } from '../constants';
import DiskPassPhraseFieldTable from '../DiskPassPhraseFieldTable';

mockI18n();

const renderTable = (passphrases = ['secret-1', 'secret-2']): ReturnType<typeof renderWithForm> =>
  renderWithForm(<DiskPassPhraseFieldTable />, {
    defaultValues: {
      [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: passphrases.map((value) => ({
        value,
      })),
    },
  });

describe('DiskPassPhraseFieldTable', () => {
  describe('reveal values', () => {
    it('masks all passphrases by default', () => {
      renderTable();

      expect(screen.getByDisplayValue('secret-1')).toHaveAttribute('type', 'password');
      expect(screen.getByDisplayValue('secret-2')).toHaveAttribute('type', 'password');
      expect(screen.getByRole('button', { name: 'Reveal values' })).toBeInTheDocument();
    });

    it('reveals the passphrases when the reveal button is clicked', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.click(screen.getByRole('button', { name: 'Reveal values' }));

      expect(screen.getByDisplayValue('secret-1')).toHaveAttribute('type', 'text');
      expect(screen.getByDisplayValue('secret-2')).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: 'Hide values' })).toBeInTheDocument();
    });

    it('masks the passphrases again when the hide button is clicked', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.click(screen.getByRole('button', { name: 'Reveal values' }));
      await user.click(screen.getByRole('button', { name: 'Hide values' }));

      expect(screen.getByDisplayValue('secret-1')).toHaveAttribute('type', 'password');
      expect(screen.getByDisplayValue('secret-2')).toHaveAttribute('type', 'password');
      expect(screen.getByRole('button', { name: 'Reveal values' })).toBeInTheDocument();
    });

    it('applies the current visibility to newly added rows', async () => {
      const user = userEvent.setup();
      renderTable(['secret-1']);

      await user.click(screen.getByRole('button', { name: 'Reveal values' }));
      await user.click(screen.getByTestId('add-mapping-button'));

      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'text');
    });
  });
});
