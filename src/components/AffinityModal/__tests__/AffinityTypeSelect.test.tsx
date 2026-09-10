import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  Operator: {
    DoesNotExist: 'DoesNotExist',
    Exists: 'Exists',
    In: 'In',
    NotIn: 'NotIn',
  },
}));

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import AffinityTypeSelect from '../AffinityTypeSelect';
import { AffinityCondition, type AffinityRowData, AffinityType } from '../utils/types';

const focusedAffinity: AffinityRowData = {
  condition: AffinityCondition.Required,
  id: '1',
  type: AffinityType.Node,
};

describe('AffinityTypeSelect', () => {
  it('shows the current type label', () => {
    render(<AffinityTypeSelect focusedAffinity={focusedAffinity} setFocusedAffinity={jest.fn()} />);

    expect(screen.getByTestId('affinity-type-select')).toHaveTextContent('Node affinity');
  });

  it('updates focused affinity type on select', async () => {
    const user = userEvent.setup();
    const setFocusedAffinity = jest.fn();

    render(
      <AffinityTypeSelect
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
      />,
    );

    await user.click(screen.getByTestId('affinity-type-select'));
    await user.click(screen.getByRole('option', { name: 'Workload (pod) affinity' }));

    expect(setFocusedAffinity).toHaveBeenCalledWith({
      ...focusedAffinity,
      type: AffinityType.Pod,
    });

    setFocusedAffinity.mockClear();
    await user.click(screen.getByTestId('affinity-type-select'));
    await user.click(screen.getByRole('option', { name: 'Workload (pod) anti-affinity' }));

    expect(setFocusedAffinity).toHaveBeenCalledWith({
      ...focusedAffinity,
      type: AffinityType.PodAnti,
    });
  });
});
