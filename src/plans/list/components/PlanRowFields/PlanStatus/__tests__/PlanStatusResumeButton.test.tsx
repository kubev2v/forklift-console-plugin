import type { ReactElement } from 'react';

import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import PlanStatus from '../PlanStatus';

mockI18n();

const mockLauncher = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useOverlay: (): typeof mockLauncher => mockLauncher,
}));

const mockUsePlanMigration = jest.fn();
jest.mock('src/plans/hooks/usePlanMigration', () => ({
  usePlanMigration: (...args: unknown[]): ReturnType<typeof mockUsePlanMigration> =>
    mockUsePlanMigration(...args),
}));

const mockCanPlanResumeConversion = jest.fn();
const mockGetPlanStatus = jest.fn();
jest.mock('src/plans/details/components/PlanStatus/utils/migrationVmStatus', () => ({
  getCantStartVMStatusCount: jest.fn((): Record<string, never> => ({})),
  getMigrationVMsStatusCounts: jest.fn((): Record<string, never> => ({})),
}));
jest.mock('src/plans/details/components/PlanStatus/utils/planStatusPermissions', () => ({
  canPlanResumeConversion: (...args: unknown[]): ReturnType<typeof mockCanPlanResumeConversion> =>
    mockCanPlanResumeConversion(...args),
}));
jest.mock('src/plans/details/components/PlanStatus/utils/planStatusResolver', () => ({
  getPlanStatus: (...args: unknown[]): ReturnType<typeof mockGetPlanStatus> =>
    mockGetPlanStatus(...args),
  isPlanArchived: jest.fn((): boolean => false),
  isPlanExecuting: jest.fn((): boolean => false),
}));

jest.mock('src/plans/details/components/PlanStatus/PlanStatusLabel', () => ({
  __esModule: true,
  default: (): ReactElement => <span>StatusLabel</span>,
}));

jest.mock('src/plans/details/components/PlanStatus/VMStatusIconsRow', () => ({
  __esModule: true,
  default: (): ReactElement => <span>VMIcons</span>,
}));

jest.mock('../hooks/usePipelineTaskProgress', () => ({
  __esModule: true,
  default: (): number => 0,
}));

jest.mock('@utils/crds/plans/selectors', () => ({
  getPlanVirtualMachines: jest.fn((): unknown[] => []),
  getPlanVirtualMachinesMigrationStatus: jest.fn((): unknown[] => []),
}));

jest.mock('@utils/helpers', () => ({
  isEmpty: jest.fn((val: unknown): boolean => !val),
}));

const makePlan = (): V1beta1Plan =>
  ({
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: { name: 'test-plan', namespace: 'test-ns', uid: 'uid-123' },
    status: {
      conditions: [{ type: 'ConversionResumable', status: 'True' }],
      migration: { vms: [{ name: 'vm-1', disksCopied: true }] },
    },
  }) as unknown as V1beta1Plan;

describe('PlanStatus Resume button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlanStatus.mockReturnValue('Failed');
    mockUsePlanMigration.mockReturnValue([undefined, true]);
  });

  it('shows Resume button when plan is resumable, loaded, and no active migration', () => {
    mockCanPlanResumeConversion.mockReturnValue(true);

    render(<PlanStatus plan={makePlan()} />);

    expect(screen.getByTestId('plan-resume-button-status')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('hides Resume button when plan is not resumable', () => {
    mockCanPlanResumeConversion.mockReturnValue(false);

    render(<PlanStatus plan={makePlan()} />);

    expect(screen.queryByTestId('plan-resume-button-status')).not.toBeInTheDocument();
  });

  it('hides Resume button when migration data is not loaded', () => {
    mockCanPlanResumeConversion.mockReturnValue(true);
    mockUsePlanMigration.mockReturnValue([undefined, false]);

    render(<PlanStatus plan={makePlan()} />);

    expect(screen.queryByTestId('plan-resume-button-status')).not.toBeInTheDocument();
  });

  it('hides Resume button when there is an active migration', () => {
    mockCanPlanResumeConversion.mockReturnValue(true);
    mockUsePlanMigration.mockReturnValue([{ metadata: { name: 'mig-1' } }, true]);

    render(<PlanStatus plan={makePlan()} />);

    expect(screen.queryByTestId('plan-resume-button-status')).not.toBeInTheDocument();
  });

  it('launches PlanResumeConversionModal on click', async () => {
    mockCanPlanResumeConversion.mockReturnValue(true);
    const plan = makePlan();

    render(<PlanStatus plan={plan} />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId('plan-resume-button-status'));

    expect(mockLauncher).toHaveBeenCalledTimes(1);
    expect(mockLauncher).toHaveBeenCalledWith(expect.any(Function), { plan });
  });
});
