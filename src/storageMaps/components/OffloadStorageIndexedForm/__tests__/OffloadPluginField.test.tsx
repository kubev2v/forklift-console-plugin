import { describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useOffloadPlugins } from '../../../hooks/useOffloadPlugins';
import OffloadPluginField from '../OffloadPluginField';

jest.mock('../../../hooks/useOffloadPlugins');
mockI18n();

const mockUseOffloadPlugins = useOffloadPlugins as jest.MockedFunction<typeof useOffloadPlugins>;

describe('OffloadPluginField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables the select when loading', () => {
    mockUseOffloadPlugins.mockReturnValue({
      error: null,
      loading: true,
      offloadPlugins: [],
    });

    renderWithForm(<OffloadPluginField fieldId="test-field" />);

    expect(screen.getByRole('button', { name: 'Select menu toggle' })).toBeDisabled();
  });

  it('allows user to open dropdown and see available plugins', async () => {
    const user = userEvent.setup();
    mockUseOffloadPlugins.mockReturnValue({
      error: null,
      loading: false,
      offloadPlugins: ['vsphereXcopyConfig', 'newPlugin'],
    });

    renderWithForm(<OffloadPluginField fieldId="test-field" />);

    const select = screen.getByRole('button', { name: 'Select menu toggle' });
    expect(select).toBeEnabled();
    expect(select).toHaveTextContent('Select offload plugin');

    await user.click(select);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows fallback plugins when there is an error', async () => {
    const user = userEvent.setup();
    mockUseOffloadPlugins.mockReturnValue({
      error: new Error('API Error'),
      loading: false,
      offloadPlugins: ['vsphereXcopyConfig'],
    });

    renderWithForm(<OffloadPluginField fieldId="test-field" />);

    const select = screen.getByRole('button', { name: 'Select menu toggle' });
    expect(select).toBeEnabled();

    await user.click(select);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
