import { GuestType, ScriptType } from 'src/plans/create/steps/customization-scripts/constants';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import type { IoK8sApiCoreV1ConfigMap, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ScriptsSection from '../components/ScriptsSection/ScriptsSection';

const mockIsPlanEditable = jest.fn();
jest.mock('src/plans/details/components/PlanStatus/utils/utils', () => ({
  isPlanEditable: jest.fn((...args) => mockIsPlanEditable(...args)),
}));

const mockLaunchOverlay = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ group: '', kind: 'ConfigMap', version: 'v1' })),
  ResourceLink: ({ name }: { name: string }) => <span data-testid="resource-link">{name}</span>,
  useOverlay: jest.fn(() => mockLaunchOverlay),
}));

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-ns' },
  spec: {},
} as unknown as V1beta1Plan;

const mockConfigMap = {
  data: {},
  metadata: { name: 'test-plan-scripts', namespace: 'test-ns' },
} as unknown as IoK8sApiCoreV1ConfigMap;

const mockScripts: CustomScript[] = [
  {
    content: '#!/bin/bash\necho hello',
    guestType: GuestType.Linux,
    name: 'setup-network',
    scriptType: ScriptType.Firstboot,
  },
  {
    content: 'Write-Host "cleanup complete"',
    guestType: GuestType.Windows,
    name: 'cleanup',
    scriptType: ScriptType.Firstboot,
  },
];

describe('ScriptsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no scripts are configured', () => {
    mockIsPlanEditable.mockReturnValue(true);

    render(<ScriptsSection configMap={undefined} plan={mockPlan} scripts={[]} />);

    expect(screen.getByText('Customization scripts')).toBeInTheDocument();
    expect(screen.getByText('No customization scripts are configured.')).toBeInTheDocument();
  });

  it('displays script details when scripts exist', () => {
    mockIsPlanEditable.mockReturnValue(true);

    render(<ScriptsSection configMap={mockConfigMap} plan={mockPlan} scripts={mockScripts} />);

    expect(screen.getByText('test-plan-scripts')).toBeInTheDocument();
    expect(screen.getByText('setup-network')).toBeInTheDocument();
    expect(screen.getByText('cleanup')).toBeInTheDocument();
    expect(screen.getByText('Linux')).toBeInTheDocument();
    expect(screen.getByText('Windows')).toBeInTheDocument();
  });

  it('shows edit button and launches overlay on click', async () => {
    const user = userEvent.setup();
    mockIsPlanEditable.mockReturnValue(true);

    render(<ScriptsSection configMap={mockConfigMap} plan={mockPlan} scripts={mockScripts} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(mockLaunchOverlay).toHaveBeenCalledTimes(1);
  });

  it('disables edit button when plan is not editable', () => {
    mockIsPlanEditable.mockReturnValue(false);

    render(<ScriptsSection configMap={mockConfigMap} plan={mockPlan} scripts={mockScripts} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeDisabled();
  });
});
