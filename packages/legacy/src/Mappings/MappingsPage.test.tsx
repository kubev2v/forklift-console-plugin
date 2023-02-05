import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MappingsPage } from 'legacy/src/Mappings/MappingsPage';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient();

describe('MappingsPage', () => {
  test('renders mappings page without errors', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MappingsPage />
      </QueryClientProvider>
    );
    const heading = screen.getByText('Mappings');
    expect(heading).toBeDefined();

    screen.getByRole('button', {
      name: /Create network mapping/i,
    });

    const storageTabBtn = screen.getByRole('tab', {
      name: /Storage/i,
    });
    storageTabBtn.click();

    const createMappingBtn = screen.getByRole('button', {
      name: /Create storage mapping/i,
    });

    expect(createMappingBtn).toBeDefined();
  });
});
