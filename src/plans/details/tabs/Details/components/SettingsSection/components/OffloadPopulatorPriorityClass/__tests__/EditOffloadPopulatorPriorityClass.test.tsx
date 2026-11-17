import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH } from '../constants';
import EditOffloadPopulatorPriorityClass from '../EditOffloadPopulatorPriorityClass';

mockI18n();

const mockK8sPatch = jest.fn((..._args: unknown[]): Promise<unknown> => Promise.resolve({}));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sPatch: (...args: unknown[]): unknown => mockK8sPatch(...args),
}));

const mockUsePriorityClasses = jest.fn(() => ({
  loaded: true,
  loadError: null,
  priorityClasses: ['high-priority'],
}));
jest.mock('@utils/hooks/usePriorityClasses', () => ({
  usePriorityClasses: (): ReturnType<typeof mockUsePriorityClasses> => mockUsePriorityClasses(),
}));

const closeOverlay = jest.fn();

const plan = {
  metadata: { name: 'plan', namespace: 'test-ns' },
  spec: { offloadPopulatorPriorityClassName: 'high-priority' },
} as unknown as V1beta1Plan;

const renderModal = (): ReturnType<typeof render> =>
  render(<EditOffloadPopulatorPriorityClass closeOverlay={closeOverlay} resource={plan} />);

describe('EditOffloadPopulatorPriorityClass', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title, label, help toggle, and both options', async () => {
    const user = userEvent.setup();
    renderModal();

    expect(screen.getByText('Edit priority class')).toBeInTheDocument();
    expect(screen.getByText('Offload populator pod priority class')).toBeInTheDocument();
    expect(screen.getByTestId('edit-offload-populator-priority-class-help')).toBeInTheDocument();

    await user.click(screen.getByTestId('offload-populator-priority-class-select'));

    expect(screen.getByRole('option', { name: 'Cluster default' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'high-priority' })).toBeInTheDocument();
  });

  it('removes the priority class when the Cluster default option is confirmed', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId('offload-populator-priority-class-select'));
    await user.click(screen.getByRole('option', { name: 'Cluster default' }));
    await user.click(screen.getByTestId('modal-confirm-button'));

    await waitFor(() => {
      expect(mockK8sPatch).toHaveBeenCalledTimes(1);
    });

    const [patchArgs] = mockK8sPatch.mock.calls[0] as [
      { data: Record<string, unknown>[]; model: unknown; resource: unknown },
    ];

    expect(patchArgs.data).toEqual([
      { op: 'remove', path: PLAN_OFFLOAD_POPULATOR_PRIORITY_CLASS_PATH },
    ]);
    expect(patchArgs.data[0]).not.toHaveProperty('value');
    expect(patchArgs.model).toBe(PlanModel);
    expect(patchArgs.resource).toBe(plan);
    expect(closeOverlay).toHaveBeenCalled();
  });
});
