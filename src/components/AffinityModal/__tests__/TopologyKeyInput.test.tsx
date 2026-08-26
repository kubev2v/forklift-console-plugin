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

import { fireEvent, render, screen } from '@testing-library/react';

import TopologyKeyInput from '../TopologyKeyInput';
import { TOPOLOGY_KEY_FIELD_HELP_TEXT } from '../utils/constants';
import { AffinityCondition, AffinityType, type AffinityRowData } from '../utils/types';

const base: AffinityRowData = {
  condition: AffinityCondition.Required,
  id: '1',
  topologyKey: 'kubernetes.io/hostname',
  type: AffinityType.Pod,
};

describe('TopologyKeyInput', () => {
  it('marks empty topology key invalid and disables submit', () => {
    const setSubmitDisabled = jest.fn();

    render(
      <TopologyKeyInput
        focusedAffinity={{ ...base, topologyKey: '' }}
        setFocusedAffinity={jest.fn()}
        setSubmitDisabled={setSubmitDisabled}
      />,
    );

    expect(setSubmitDisabled).toHaveBeenCalledWith(true);
    expect(screen.getByText(TOPOLOGY_KEY_FIELD_HELP_TEXT)).toBeInTheDocument();
  });

  it('updates topology key on change', () => {
    const setFocusedAffinity = jest.fn();

    render(
      <TopologyKeyInput
        focusedAffinity={base}
        setFocusedAffinity={setFocusedAffinity}
        setSubmitDisabled={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('affinity-topology-key-input'), {
      target: { value: 'topology.kubernetes.io/zone' },
    });

    expect(setFocusedAffinity).toHaveBeenCalledWith({
      ...base,
      topologyKey: 'topology.kubernetes.io/zone',
    });
  });
});
