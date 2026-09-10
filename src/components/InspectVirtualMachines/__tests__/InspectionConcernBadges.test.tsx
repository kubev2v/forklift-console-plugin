import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import InspectionConcernBadges from '../InspectionConcernBadges';

describe('InspectionConcernBadges', () => {
  it('renders nothing for empty concerns', () => {
    render(<InspectionConcernBadges concerns={[]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders category badges and popover content', async () => {
    const user = userEvent.setup();

    render(
      <InspectionConcernBadges
        concerns={[
          { category: 'Warning', id: '1', label: 'Shared disk', message: 'Shared disk msg' },
          { category: 'Critical', id: '2', label: 'UEFI', message: 'UEFI msg' },
          { category: 'Warning', id: '3', label: 'CPU', message: 'CPU msg' },
        ]}
      />,
    );

    const warningBadge = screen.getByRole('button', { name: '2' });
    const criticalBadge = screen.getByRole('button', { name: '1' });
    expect(warningBadge).toBeInTheDocument();
    expect(criticalBadge).toBeInTheDocument();

    await user.click(warningBadge);
    expect(screen.getByLabelText('Warning inspection concerns')).toBeInTheDocument();
    expect(screen.getByText('Warning inspection concerns')).toBeInTheDocument();
    expect(screen.getByText('Total: 2')).toBeInTheDocument();
    expect(screen.getByText('Shared disk')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();

    await user.click(criticalBadge);
    expect(screen.getByLabelText('Critical inspection concerns')).toBeInTheDocument();
    expect(screen.getByText('Critical inspection concerns')).toBeInTheDocument();
    expect(screen.getByText('Total: 1')).toBeInTheDocument();
    expect(screen.getByText('UEFI')).toBeInTheDocument();
  });
});
