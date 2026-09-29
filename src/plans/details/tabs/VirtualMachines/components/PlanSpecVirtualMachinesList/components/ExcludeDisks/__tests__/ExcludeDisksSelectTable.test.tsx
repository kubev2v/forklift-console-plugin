import { MemoryRouter } from 'react-router';

import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen } from '@testing-library/react';

import ExcludeDisksSelectTable from '../ExcludeDisksSelectTable';

mockI18n();

describe('ExcludeDisksSelectTable', () => {
  it('renders disk rows and column headers', () => {
    render(
      <MemoryRouter>
        <ExcludeDisksSelectTable
          isLoading={false}
          loadError={null}
          onSelect={() => undefined}
          rows={[
            {
              busAddress: 'scsi0:0',
              fileName: 'root.vmdk',
              id: 'scsi0:0',
              inInventory: true,
              shared: false,
              sharedFilterValue: 'no',
              sizeBytes: 85899345920,
              sizeLabel: '80 GiB',
            },
          ]}
          selectedIds={['scsi0:0']}
        />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Bus address').length).toBeGreaterThan(0);
    expect(screen.getByText('scsi0:0')).toBeInTheDocument();
    expect(screen.getByText('root.vmdk')).toBeInTheDocument();
  });
});
