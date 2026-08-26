import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import InspectionConcernBadges from '../InspectionConcernBadges';

describe('InspectionConcernBadges', () => {
  it('renders nothing for empty concerns', () => {
    const { container } = render(<InspectionConcernBadges concerns={[]} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders category badges and popover content', async () => {
    const user = userEvent.setup();

    render(
      <InspectionConcernBadges
        concerns={[
          { category: 'Warning', id: '1', label: 'Shared disk' },
          { category: 'Critical', id: '2', label: 'UEFI' },
          { category: 'Warning', id: '3', label: 'CPU' },
        ]}
      />,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /2/ }));
    expect(screen.getByText('Shared disk')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();
  });
});
