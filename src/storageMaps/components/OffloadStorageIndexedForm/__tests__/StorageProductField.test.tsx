import { describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen } from '@testing-library/react';

import { useStorageVendorProducts } from '../../../hooks/useStorageVendorProducts';
import StorageProductField from '../StorageProductField';

jest.mock('../../../hooks/useStorageVendorProducts');
mockI18n();

const mockUseStorageVendorProducts = useStorageVendorProducts as jest.MockedFunction<
  typeof useStorageVendorProducts
>;

describe('StorageProductField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows disabled state when hook is loading', () => {
    mockUseStorageVendorProducts.mockReturnValue({
      error: null,
      loading: true,
      storageVendorProducts: [],
    });

    renderWithForm(<StorageProductField fieldId="test-field" />);

    const select = screen.getByRole('button', { name: 'Select menu toggle' });
    expect(select).toBeDisabled();
  });

  it('shows options when hook returns products', () => {
    mockUseStorageVendorProducts.mockReturnValue({
      error: null,
      loading: false,
      storageVendorProducts: ['vantara', 'ontap', 'newProduct'],
    });

    renderWithForm(<StorageProductField fieldId="test-field" />);

    const select = screen.getByRole('button', { name: 'Select menu toggle' });
    expect(select).toBeEnabled();
    expect(screen.getByText('Select storage product')).toBeInTheDocument();
  });

  it('shows fallback when hook has error', () => {
    mockUseStorageVendorProducts.mockReturnValue({
      error: new Error('API Error'),
      loading: false,
      storageVendorProducts: ['vantara', 'ontap'],
    });

    renderWithForm(<StorageProductField fieldId="test-field" />);

    const select = screen.getByRole('button', { name: 'Select menu toggle' });
    expect(select).toBeEnabled();
  });
});
