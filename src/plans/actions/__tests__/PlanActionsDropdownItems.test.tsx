import { MemoryRouter } from 'react-router';

import type { V1beta1Plan } from '@forklift-ui/types';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen } from '@testing-library/react';

import { PlanStatuses } from '../../details/components/PlanStatus/utils/types';
import type { usePlanActionsDropdown } from '../hooks/usePlanActionsDropdown';
import PlanActionsDropdownItems from '../PlanActionsDropdownItems';

mockI18n();

const mockUsePlanActionsDropdown = jest.fn();
jest.mock('../hooks/usePlanActionsDropdown', () => ({
  usePlanActionsDropdown: jest.fn((...args: unknown[]) => mockUsePlanActionsDropdown(...args)),
}));

type HookReturn = ReturnType<typeof usePlanActionsDropdown>;

const plan = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
} as V1beta1Plan;

const buildHookReturn = (overrides: Partial<HookReturn> = {}): HookReturn => ({
  activeMigration: undefined,
  buttonStartLabel: 'Start',
  canDelete: true,
  canReStart: false,
  canResume: false,
  canScheduleCutover: false,
  canStart: true,
  hasCutover: false,
  migrationLoaded: true,
  onClickArchive: jest.fn(),
  onClickDuplicate: jest.fn(),
  onClickPlanCutover: jest.fn(),
  onClickPlanDelete: jest.fn(),
  onClickPlanStart: jest.fn(),
  onClickResumeConversion: jest.fn(),
  planStatus: PlanStatuses.Ready,
  planURL: '/plans/test-ns/test-plan',
  ...overrides,
});

const renderDropdown = (): void => {
  render(
    <MemoryRouter>
      <PlanActionsDropdownItems plan={plan} />
    </MemoryRouter>,
  );
};

const getMenuItem = (name: string): HTMLElement => screen.getByRole('menuitem', { name });

describe('PlanActionsDropdownItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlanActionsDropdown.mockReturnValue(buildHookReturn());
  });

  describe('Archive', () => {
    it('is enabled when the plan is Ready and canDelete is true', () => {
      renderDropdown();

      expect(getMenuItem('Archive')).toBeEnabled();
    });

    it('is disabled when the plan is Executing', () => {
      mockUsePlanActionsDropdown.mockReturnValue(
        buildHookReturn({ planStatus: PlanStatuses.Executing }),
      );
      renderDropdown();

      expect(getMenuItem('Archive')).toBeDisabled();
    });

    it('is disabled when the plan is Pending', () => {
      mockUsePlanActionsDropdown.mockReturnValue(
        buildHookReturn({ planStatus: PlanStatuses.Pending }),
      );
      renderDropdown();

      expect(getMenuItem('Archive')).toBeDisabled();
    });

    it('is disabled when the plan is Archived', () => {
      mockUsePlanActionsDropdown.mockReturnValue(
        buildHookReturn({ planStatus: PlanStatuses.Archived }),
      );
      renderDropdown();

      expect(getMenuItem('Archive')).toBeDisabled();
    });

    it('is disabled when canDelete is false', () => {
      mockUsePlanActionsDropdown.mockReturnValue(buildHookReturn({ canDelete: false }));
      renderDropdown();

      expect(getMenuItem('Archive')).toBeDisabled();
    });
  });

  describe('Delete', () => {
    it('is enabled when the plan is Ready and canDelete is true', () => {
      renderDropdown();

      expect(getMenuItem('Delete')).toBeEnabled();
    });

    it('is disabled when the plan is Executing', () => {
      mockUsePlanActionsDropdown.mockReturnValue(
        buildHookReturn({ planStatus: PlanStatuses.Executing }),
      );
      renderDropdown();

      expect(getMenuItem('Delete')).toBeDisabled();
    });

    it('is disabled when the plan is Pending', () => {
      mockUsePlanActionsDropdown.mockReturnValue(
        buildHookReturn({ planStatus: PlanStatuses.Pending }),
      );
      renderDropdown();

      expect(getMenuItem('Delete')).toBeDisabled();
    });

    it('is disabled when canDelete is false', () => {
      mockUsePlanActionsDropdown.mockReturnValue(buildHookReturn({ canDelete: false }));
      renderDropdown();

      expect(getMenuItem('Delete')).toBeDisabled();
    });
  });
});
