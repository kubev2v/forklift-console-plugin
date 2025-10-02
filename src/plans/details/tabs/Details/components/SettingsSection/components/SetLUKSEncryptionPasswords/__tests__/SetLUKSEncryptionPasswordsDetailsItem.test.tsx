import { beforeEach, describe, expect, it } from '@jest/globals';
import type { V1beta1Plan } from '@kubev2v/types';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import SetLUKSEncryptionPasswordsDetailsItem from '../SetLUKSEncryptionPasswordsDetailsItem';

const mockIsPlanEditable = jest.fn();
jest.mock('src/plans/details/components/PlanStatus/utils/utils', () => ({
  isPlanEditable: jest.fn((...args) => mockIsPlanEditable(...args)),
}));

const mockShowModal = jest.fn();
jest.mock('src/modules/Providers/modals/ModalHOC/ModalHOC', () => ({
  useModal: () => ({ showModal: mockShowModal }),
}));

// LUKSSecretLink is not mocked to test the real badge functionality

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(),
  ResourceLink: ({ name }: { name: string }) => <span data-testid="resource-link">{name}</span>,
}));

jest.mock('../EditLUKSEncryptionPasswords', () => ({ resource }: { resource: V1beta1Plan }) => (
  <div data-testid="edit-luks-modal">Modal for {resource.metadata?.name}</div>
));

const mockPlan = {
  metadata: { name: 'test-plan', namespace: 'test-namespace' },
  spec: { vms: [] },
} as unknown as V1beta1Plan;

describe('SetLUKSEncryptionPasswordsDetailsItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when shouldRender is false', () => {
    const { container } = render(
      <SetLUKSEncryptionPasswordsDetailsItem
        canPatch={true}
        plan={mockPlan}
        shouldRender={false}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows disk decryption title and no decryption keys label when no LUKS or NBDE', () => {
    mockIsPlanEditable.mockReturnValue(true);

    render(
      <SetLUKSEncryptionPasswordsDetailsItem canPatch={true} plan={mockPlan} shouldRender={true} />,
    );

    expect(screen.getByText('Disk decryption')).toBeInTheDocument();
    expect(screen.getByTestId('no-decryption-keys-label')).toBeInTheDocument();
    expect(screen.getByText('No decryption defined')).toBeInTheDocument();
  });

  it('allows editing when permissions allow', async () => {
    const user = userEvent.setup();
    mockIsPlanEditable.mockReturnValue(true);

    render(
      <SetLUKSEncryptionPasswordsDetailsItem canPatch={true} plan={mockPlan} shouldRender={true} />,
    );

    const editButton = screen.getByRole('button', { name: '' });
    expect(editButton).toBeEnabled();

    await user.click(editButton);
    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('disables editing when canPatch is false', () => {
    mockIsPlanEditable.mockReturnValue(true);

    render(
      <SetLUKSEncryptionPasswordsDetailsItem
        canPatch={false}
        plan={mockPlan}
        shouldRender={true}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(1); // Only the help button, no edit button
  });

  it('disables editing when plan is not editable', () => {
    mockIsPlanEditable.mockReturnValue(false);

    render(
      <SetLUKSEncryptionPasswordsDetailsItem canPatch={true} plan={mockPlan} shouldRender={true} />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(1); // Only the help button, no edit button
  });

  it('shows NBDE/Clevis enabled label when NBDE is enabled', () => {
    mockIsPlanEditable.mockReturnValue(true);
    const planWithNBDE = {
      ...mockPlan,
      spec: { vms: [{ nbdeClevis: true }] },
    } as unknown as V1beta1Plan;

    render(
      <SetLUKSEncryptionPasswordsDetailsItem
        canPatch={true}
        plan={planWithNBDE}
        shouldRender={true}
      />,
    );

    expect(screen.getByText('Disk decryption')).toBeInTheDocument();
    expect(screen.getByTestId('nbde-clevis-enabled-label')).toBeInTheDocument();
    expect(screen.getByText('NBDE/Clevis enabled')).toBeInTheDocument();
  });

  it('shows resource link when LUKS secret exists', () => {
    mockIsPlanEditable.mockReturnValue(true);
    const planWithLUKS = {
      ...mockPlan,
      spec: { vms: [{ luks: { name: 'test-secret' } }] },
    } as unknown as V1beta1Plan;

    render(
      <SetLUKSEncryptionPasswordsDetailsItem
        canPatch={true}
        plan={planWithLUKS}
        shouldRender={true}
      />,
    );

    expect(screen.getByText('Disk decryption')).toBeInTheDocument();
    expect(screen.getByTestId('resource-link')).toBeInTheDocument();
    expect(screen.getByText('test-secret')).toBeInTheDocument();
  });

  it('prioritizes NBDE label over LUKS secret when both exist', () => {
    mockIsPlanEditable.mockReturnValue(true);
    const planWithBoth = {
      ...mockPlan,
      spec: { vms: [{ nbdeClevis: true, luks: { name: 'test-secret' } }] },
    } as unknown as V1beta1Plan;

    render(
      <SetLUKSEncryptionPasswordsDetailsItem
        canPatch={true}
        plan={planWithBoth}
        shouldRender={true}
      />,
    );

    expect(screen.getByText('Disk decryption')).toBeInTheDocument();
    expect(screen.getByTestId('nbde-clevis-enabled-label')).toBeInTheDocument();
    expect(screen.getByText('NBDE/Clevis enabled')).toBeInTheDocument();
    expect(screen.queryByTestId('resource-link')).not.toBeInTheDocument();
  });
});
