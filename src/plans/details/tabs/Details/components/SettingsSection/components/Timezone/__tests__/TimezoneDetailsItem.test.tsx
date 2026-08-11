import type { V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import TimezoneDetailsItem from '../TimezoneDetailsItem';

const mockIsPlanEditable = jest.fn();
jest.mock('src/plans/details/components/PlanStatus/utils/utils', () => ({
  isPlanEditable: jest.fn((...args) => mockIsPlanEditable(...args)),
}));

const mockShowModal = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(),
  useModal: jest.fn(() => mockShowModal),
}));

jest.mock('../EditTimezone', () => ({ resource }: { resource: V1beta1Plan }) => (
  <div data-testid="edit-timezone-modal">Modal for {resource.metadata?.name}</div>
));

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: {},
} as unknown as V1beta1Plan;

const mockPlanWithTimezone = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: { timezone: 'America/New_York' },
} as unknown as V1beta1Plan;

describe('TimezoneDetailsItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders source provider default when no timezone is set', () => {
    mockIsPlanEditable.mockReturnValue(true);

    render(<TimezoneDetailsItem canPatch={true} plan={mockPlan} />);

    expect(screen.getByText('Source provider default')).toBeInTheDocument();
  });

  it('renders the configured timezone when set', () => {
    mockIsPlanEditable.mockReturnValue(true);

    render(<TimezoneDetailsItem canPatch={true} plan={mockPlanWithTimezone} />);

    expect(screen.getByText('America/New_York')).toBeInTheDocument();
  });

  it('allows editing when canPatch and plan is editable', async () => {
    const user = userEvent.setup();
    mockIsPlanEditable.mockReturnValue(true);

    render(<TimezoneDetailsItem canPatch={true} plan={mockPlan} />);

    const editButton = screen.getByRole('button', { name: '' });
    expect(editButton).toBeEnabled();

    await user.click(editButton);
    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('disables editing when canPatch is false', () => {
    mockIsPlanEditable.mockReturnValue(true);

    render(<TimezoneDetailsItem canPatch={false} plan={mockPlan} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('disables editing when plan is not editable', () => {
    mockIsPlanEditable.mockReturnValue(false);

    render(<TimezoneDetailsItem canPatch={true} plan={mockPlan} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
