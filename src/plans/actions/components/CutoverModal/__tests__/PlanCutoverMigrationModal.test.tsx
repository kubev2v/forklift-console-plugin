import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

const mockPatchMigrationCutover = jest.fn().mockResolvedValue(undefined);
jest.mock('../utils/utils', () => ({
  formatDateTo12Hours: jest.fn(() => '12:00 PM'),
  patchMigrationCutover: jest.fn((...args) => mockPatchMigrationCutover(...args)),
}));

const mockUsePlanMigration = jest.fn();
jest.mock('src/plans/hooks/usePlanMigration', () => ({
  usePlanMigration: jest.fn((...args) => mockUsePlanMigration(...args)),
}));

const mockT = (key: string): string => key;

jest.mock('src/utils/i18n', () => ({
  ForkliftTrans: ({ children }: { children: unknown }) => children,
  t: mockT,
  useForkliftTranslation: () => ({ t: mockT }),
}));

jest.mock('@utils/i18n', () => ({
  ForkliftTrans: ({ children }: { children: unknown }) => children,
  t: mockT,
  useForkliftTranslation: () => ({ t: mockT }),
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('@utils/crds/common/selectors', () => ({
  getName: jest.fn(() => 'test-plan'),
}));

// eslint-disable-next-line import/first
import PlanCutoverMigrationModal from '../PlanCutoverMigrationModal';

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: { warm: true },
} as unknown as V1beta1Plan;

const mockMigrationWithoutCutover = {
  metadata: { name: 'test-migration', namespace: 'test-ns' },
  spec: {},
} as unknown as V1beta1Migration;

const mockMigrationWithCutover = {
  metadata: { name: 'test-migration', namespace: 'test-ns' },
  spec: { cutover: '2026-08-15T10:00:00.000Z' },
} as unknown as V1beta1Migration;

const closeModal = jest.fn();

describe('PlanCutoverMigrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('new cutover (no existing cutover)', () => {
    beforeEach(() => {
      mockUsePlanMigration.mockReturnValue([mockMigrationWithoutCutover, true, null]);
    });

    it('renders with ASAP radio selected by default', () => {
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      const asapRadio = screen.getByTestId('cutover-mode-asap');
      const scheduledRadio = screen.getByTestId('cutover-mode-scheduled');

      expect(asapRadio).toBeChecked();
      expect(scheduledRadio).not.toBeChecked();
    });

    it('hides date/time pickers when ASAP is selected', () => {
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      expect(screen.queryByLabelText('Cutover date')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Cutover time')).not.toBeInTheDocument();
    });

    it('shows date/time pickers when scheduled is selected', async () => {
      const user = userEvent.setup();
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      await user.click(screen.getByTestId('cutover-mode-scheduled'));

      expect(screen.getByLabelText('Cutover date')).toBeInTheDocument();
      expect(screen.getByLabelText('Cutover time')).toBeInTheDocument();
    });

    it('patches with current timestamp when ASAP confirmed', async () => {
      const user = userEvent.setup();
      const now = '2026-07-06T10:00:00.000Z';
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(now);

      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

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
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      expect(screen.queryByRole('button', { name: /remove cutover/i })).not.toBeInTheDocument();
    });
  });

  describe('editing existing cutover', () => {
    beforeEach(() => {
      mockUsePlanMigration.mockReturnValue([mockMigrationWithCutover, true, null]);
    });

    it('defaults to scheduled mode when cutover already exists', () => {
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      const asapRadio = screen.getByTestId('cutover-mode-asap');
      const scheduledRadio = screen.getByTestId('cutover-mode-scheduled');

      expect(asapRadio).not.toBeChecked();
      expect(scheduledRadio).toBeChecked();
    });

    it('shows date/time pickers pre-filled in edit mode', () => {
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      expect(screen.getByLabelText('Cutover date')).toBeInTheDocument();
      expect(screen.getByLabelText('Cutover time')).toBeInTheDocument();
    });

    it('shows Remove cutover action in scheduled mode', () => {
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      expect(screen.getByRole('button', { name: /remove cutover/i })).toBeInTheDocument();
    });

    it('hides Remove cutover action when switching to ASAP', async () => {
      const user = userEvent.setup();
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      await user.click(screen.getByTestId('cutover-mode-asap'));

      expect(screen.queryByRole('button', { name: /remove cutover/i })).not.toBeInTheDocument();
    });

    it('shows Edit cutover as title when cutover exists', () => {
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      expect(screen.getByText('Edit cutover')).toBeInTheDocument();
    });
  });

  describe('past date info alert', () => {
    const mockMigrationWithPastCutover = {
      metadata: { name: 'test-migration', namespace: 'test-ns' },
      spec: { cutover: '2020-01-01T10:00:00.000Z' },
    } as unknown as V1beta1Migration;

    it('shows info alert when scheduled date is in the past', () => {
      mockUsePlanMigration.mockReturnValue([mockMigrationWithPastCutover, true, null]);

      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      expect(
        screen.getByText(
          'The selected time is in the past. Cutover will begin immediately, equivalent to the ASAP option.',
        ),
      ).toBeInTheDocument();
    });

    it('does not show info alert when scheduled date is in the future', () => {
      mockUsePlanMigration.mockReturnValue([mockMigrationWithCutover, true, null]);

      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

      expect(
        screen.queryByText(
          'The selected time is in the past. Cutover will begin immediately, equivalent to the ASAP option.',
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('radio toggle behavior', () => {
    beforeEach(() => {
      mockUsePlanMigration.mockReturnValue([mockMigrationWithoutCutover, true, null]);
    });

    it('toggles between ASAP and scheduled modes', async () => {
      const user = userEvent.setup();
      render(<PlanCutoverMigrationModal plan={mockPlan} closeModal={closeModal} />);

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
});
