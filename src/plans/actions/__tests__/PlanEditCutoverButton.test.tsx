import type { V1beta1Migration, V1beta1Plan } from '@forklift-ui/types';
import { ButtonVariant } from '@patternfly/react-core';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import PlanCutoverMigrationModal from '../components/CutoverModal/PlanCutoverMigrationModal';
import PlanEditCutoverButton from '../PlanEditCutoverButton';

mockI18n();

const mockUsePlanMigration = jest.fn();
jest.mock('src/plans/hooks/usePlanMigration', () => ({
  usePlanMigration: jest.fn((...args: unknown[]) => mockUsePlanMigration(...args)),
}));

const mockLauncher = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useOverlay: (): typeof mockLauncher => mockLauncher,
}));

const buildPlan = (
  specOverrides: Partial<V1beta1Plan['spec']> = {},
  statusOverrides: Partial<V1beta1Plan['status']> = {},
): V1beta1Plan =>
  ({
    metadata: { name: 'test-plan', namespace: 'test-ns' },
    spec: { warm: true, ...specOverrides },
    status: {
      conditions: [{ status: 'True', type: 'Executing' }],
      // A running VM (started=true) is required, otherwise getPlanStatus() treats an
      // executing plan with no VM status yet as "Pending" and the button stays hidden.
      migration: { vms: [{ started: true }] },
      ...statusOverrides,
    },
  }) as unknown as V1beta1Plan;

const runningMigrationWithoutCutover = {
  metadata: { name: 'test-migration', namespace: 'test-ns' },
  spec: {},
} as unknown as V1beta1Migration;

const runningMigrationWithCutover = {
  metadata: { name: 'test-migration', namespace: 'test-ns' },
  spec: { cutover: '2026-08-15T10:00:00.000Z' },
} as unknown as V1beta1Migration;

describe('PlanEditCutoverButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlanMigration.mockReturnValue([runningMigrationWithoutCutover, true, undefined]);
  });

  it('renders nothing when the plan is not warm', () => {
    const { container } = render(
      <PlanEditCutoverButton plan={buildPlan({ warm: false })} variant={ButtonVariant.primary} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the plan is not executing', () => {
    const plan = buildPlan({}, { conditions: [] });
    const { container } = render(
      <PlanEditCutoverButton plan={plan} variant={ButtonVariant.primary} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the plan is archived', () => {
    const plan = buildPlan({ archived: true });
    const { container } = render(
      <PlanEditCutoverButton plan={plan} variant={ButtonVariant.primary} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the plan status is Pending', () => {
    // Executing condition but no VM status yet → getPlanStatus() returns Pending
    const plan = buildPlan({}, { migration: { vms: [] } });
    const { container } = render(
      <PlanEditCutoverButton plan={plan} variant={ButtonVariant.primary} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders "Schedule cutover" when there is a running migration without an existing cutover', () => {
    render(<PlanEditCutoverButton plan={buildPlan()} variant={ButtonVariant.primary} />);

    expect(screen.getByRole('button', { name: 'Schedule cutover' })).toBeInTheDocument();
  });

  it('renders "Edit cutover" when the running migration already has a cutover set', () => {
    mockUsePlanMigration.mockReturnValue([runningMigrationWithCutover, true, undefined]);
    render(<PlanEditCutoverButton plan={buildPlan()} variant={ButtonVariant.primary} />);

    expect(screen.getByRole('button', { name: 'Edit cutover' })).toBeInTheDocument();
  });

  it('opens the cutover modal on click', async () => {
    const user = userEvent.setup();
    const plan = buildPlan();
    render(<PlanEditCutoverButton plan={plan} variant={ButtonVariant.primary} />);

    await user.click(screen.getByRole('button', { name: 'Schedule cutover' }));

    expect(mockLauncher).toHaveBeenCalledWith(PlanCutoverMigrationModal, { plan });
  });
});
