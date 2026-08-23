import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './planCutoverMigrationModal.mocks';

import PlanCutoverMigrationModal from '../PlanCutoverMigrationModal';

import {
  closeOverlay,
  mockMigrationWithCutover,
  mockPlan,
  mockUsePlanMigration,
} from './planCutoverMigrationModal.mocks';

describe('PlanCutoverMigrationModal - editing cutover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlanMigration.mockReturnValue([mockMigrationWithCutover, true, null]);
  });

  it('defaults to scheduled mode when cutover already exists', () => {
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    const asapRadio = screen.getByTestId('cutover-mode-asap');
    const scheduledRadio = screen.getByTestId('cutover-mode-scheduled');

    expect(asapRadio).not.toBeChecked();
    expect(scheduledRadio).toBeChecked();
  });

  it('shows date/time pickers pre-filled in edit mode', () => {
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(screen.getByLabelText('Cutover date')).toBeInTheDocument();
    expect(screen.getByLabelText('Cutover time')).toBeInTheDocument();
  });

  it('shows Remove cutover action in scheduled mode', () => {
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(screen.getByRole('button', { name: /remove cutover/i })).toBeInTheDocument();
  });

  it('hides Remove cutover action when switching to ASAP', async () => {
    const user = userEvent.setup();
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    await user.click(screen.getByTestId('cutover-mode-asap'));

    expect(screen.queryByRole('button', { name: /remove cutover/i })).not.toBeInTheDocument();
  });

  it('shows Edit cutover as title when cutover exists', () => {
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(screen.getByText('Edit cutover')).toBeInTheDocument();
  });
});

describe('PlanCutoverMigrationModal - past date alert', () => {
  const mockMigrationWithPastCutover = {
    metadata: { name: 'test-migration', namespace: 'test-ns' },
    spec: { cutover: '2020-01-01T10:00:00.000Z' },
  };

  it('shows info alert when scheduled date is in the past', () => {
    mockUsePlanMigration.mockReturnValue([mockMigrationWithPastCutover, true, null]);

    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(
      screen.getByText(
        'The selected time is in the past. Cutover will begin immediately, equivalent to the ASAP option.',
      ),
    ).toBeInTheDocument();
  });

  it('does not show info alert when scheduled date is in the future', () => {
    mockUsePlanMigration.mockReturnValue([mockMigrationWithCutover, true, null]);

    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(
      screen.queryByText(
        'The selected time is in the past. Cutover will begin immediately, equivalent to the ASAP option.',
      ),
    ).not.toBeInTheDocument();
  });
});
