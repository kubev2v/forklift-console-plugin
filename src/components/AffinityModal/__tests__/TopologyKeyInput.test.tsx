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

import TopologyKeyInput from '../TopologyKeyInput';
import { AffinityCondition, type AffinityRowData, AffinityType } from '../utils/types';

const base: AffinityRowData = {
  condition: AffinityCondition.Required,
  id: '1',
  topologyKey: 'kubernetes.io/hostname',
  type: AffinityType.Pod,
};

describe('TopologyKeyInput', () => {
  it('marks empty topology key invalid via aria-invalid and error helper', () => {
    render(
      <TopologyKeyInput
        focusedAffinity={{ ...base, topologyKey: '' }}
        setFocusedAffinity={jest.fn()}
      />,
    );

    expect(screen.getByTestId('affinity-topology-key-input')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByTestId('form-helper-text-error')).toBeInTheDocument();
  });

  it('marks non-empty topology key valid', () => {
    render(<TopologyKeyInput focusedAffinity={base} setFocusedAffinity={jest.fn()} />);

    expect(screen.getByTestId('affinity-topology-key-input')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
    expect(screen.queryByTestId('form-helper-text-error')).not.toBeInTheDocument();
  });

  it('updates topology key on change', async () => {
    const user = userEvent.setup();
    const setFocusedAffinity = jest.fn();

    render(<TopologyKeyInput focusedAffinity={base} setFocusedAffinity={setFocusedAffinity} />);

    await user.clear(screen.getByTestId('affinity-topology-key-input'));
    await user.type(
      screen.getByTestId('affinity-topology-key-input'),
      'topology.kubernetes.io/zone',
    );

    expect(setFocusedAffinity).toHaveBeenCalledWith(
      expect.objectContaining({ topologyKey: expect.any(String) }),
    );
  });
});
