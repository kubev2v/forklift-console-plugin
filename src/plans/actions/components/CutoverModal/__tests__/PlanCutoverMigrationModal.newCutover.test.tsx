import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './planCutoverMigrationModal.mocks';

import PlanCutoverMigrationModal from '../PlanCutoverMigrationModal';

import {
  closeOverlay,
  mockMigrationWithoutCutover,
  mockPatchMigrationCutover,
  mockPlan,
  mockUsePlanMigration,
} from './planCutoverMigrationModal.mocks';

describe('PlanCutoverMigrationModal - new cutover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlanMigration.mockReturnValue([mockMigrationWithoutCutover, true, null]);
  });

  it('renders with ASAP radio selected by default', () => {
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    const asapRadio = screen.getByTestId('cutover-mode-asap');
    const scheduledRadio = screen.getByTestId('cutover-mode-scheduled');

    expect(asapRadio).toBeChecked();
    expect(scheduledRadio).not.toBeChecked();
  });

  it('hides date/time pickers when ASAP is selected', () => {
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(screen.queryByLabelText('Cutover date')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cutover time')).not.toBeInTheDocument();
  });

  it('shows date/time pickers when scheduled is selected', async () => {
    const user = userEvent.setup();
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    await user.click(screen.getByTestId('cutover-mode-scheduled'));

    expect(screen.getByLabelText('Cutover date')).toBeInTheDocument();
    expect(screen.getByLabelText('Cutover time')).toBeInTheDocument();
  });

  it('patches with current timestamp when ASAP confirmed', async () => {
    const user = userEvent.setup();
    const now = '2026-07-06T10:00:00.000Z';
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(now);

    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    const confirmButton = screen.getByRole('button', { name: /set cutover/i });
    await user.click(confirmButton);

    expect(mockPatchMigrationCutover).toHaveBeenCalledWith(
      mockMigrationWithoutCutover,
      now,
      expect.any(Function),
    );

    jest.restoreAllMocks();
  });

  it('does not show Remove cutover action when ASAP is selected', () => {
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(screen.queryByRole('button', { name: /remove cutover/i })).not.toBeInTheDocument();
  });

  it('toggles between ASAP and scheduled modes', async () => {
    const user = userEvent.setup();
    render(<PlanCutoverMigrationModal closeOverlay={closeOverlay} plan={mockPlan} />);

    expect(screen.getByTestId('cutover-mode-asap')).toBeChecked();
    expect(screen.queryByLabelText('Cutover date')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('cutover-mode-scheduled'));
    expect(screen.getByTestId('cutover-mode-scheduled')).toBeChecked();
    expect(screen.getByLabelText('Cutover date')).toBeInTheDocument();

    await user.click(screen.getByTestId('cutover-mode-asap'));
    expect(screen.getByTestId('cutover-mode-asap')).toBeChecked();
    expect(screen.queryByLabelText('Cutover date')).not.toBeInTheDocument();
  });
});
