import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ExcludeDisksCellRenderer } from '../ExcludeDisksCellRenderer';

describe('ExcludeDisksCellRenderer', () => {
  it('shows empty message when no exclusions', () => {
    render(<ExcludeDisksCellRenderer specVM={{ id: '1', name: 'vm' }} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('lists excluded bus addresses', () => {
    render(
      <ExcludeDisksCellRenderer
        specVM={{ excludeDisks: ['scsi0:1', 'scsi0:2'], id: '1', name: 'vm' }}
      />,
    );

    expect(screen.getByText('scsi0:1, scsi0:2')).toBeInTheDocument();
  });
});
