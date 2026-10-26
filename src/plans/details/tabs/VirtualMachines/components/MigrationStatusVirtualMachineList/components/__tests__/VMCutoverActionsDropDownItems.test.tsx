import type { V1beta1Migration, V1beta1MigrationSpec } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

const mockLaunchOverlay = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useOverlay: (): unknown => mockLaunchOverlay,
}));

import VMCutoverActionsDropDownItems from '../VMMigrationActionsDropdownItems';

const VM_ID = 'vm-1000';
const VM_NAME = 'mtv-tests-rhel8';
const PLAN_CUTOVER = '2030-10-20T10:00:00.000Z';
const VM_CUTOVER = '2030-10-21T18:30:00.000Z';
const ITEM_TESTID = 'edit-vm-cutover-item';

const buildMigration = (spec: Partial<V1beta1MigrationSpec>): V1beta1Migration =>
  ({ spec }) as unknown as V1beta1Migration;

const inheriting = buildMigration({ cutover: PLAN_CUTOVER });
const overridden = buildMigration({
  cutover: PLAN_CUTOVER,
  vmCutover: [{ cutover: VM_CUTOVER, id: VM_ID }],
});

const renderItems = (migration: V1beta1Migration, isInStorePowerState = false): void => {
  render(
    <VMCutoverActionsDropDownItems
      isInStorePowerState={isInStorePowerState}
      migration={migration}
      vmId={VM_ID}
      vmName={VM_NAME}
    />,
  );
};

describe('VMCutoverActionsDropDownItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('labels the item by whether the VM already has an override', () => {
    renderItems(inheriting);
    expect(screen.getByTestId(ITEM_TESTID)).toHaveTextContent('Schedule cutover');

    renderItems(overridden);
    expect(screen.getAllByTestId(ITEM_TESTID).at(-1)).toHaveTextContent('Edit cutover');
  });

  it('launches the modal with the migration and VM identity', async () => {
    renderItems(overridden);

    // data-testid sits on the <li>; the clickable element is the inner menuitem button.
    await userEvent.setup().click(screen.getByRole('menuitem'));

    expect(mockLaunchOverlay).toHaveBeenCalledWith(expect.anything(), {
      migration: overridden,
      vmId: VM_ID,
      vmName: VM_NAME,
    });
  });

  it('disables the item with a reason once final cutover has started', () => {
    // The backend only reads per-VM cutover while the VM is still in CopyingPaused.
    renderItems(overridden, true);

    expect(screen.getByRole('menuitem')).toBeDisabled();
    expect(
      screen.getByText('Cannot change the cutover time after the final cutover has started'),
    ).toBeInTheDocument();
  });
});
