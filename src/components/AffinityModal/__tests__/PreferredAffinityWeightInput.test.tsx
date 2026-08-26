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

import PreferredAffinityWeightInput from '../PreferredAffinityWeightInput';
import { WEIGHT_FIELD_HELP_TEXT } from '../utils/constants';
import { AffinityCondition, AffinityType, type AffinityRowData } from '../utils/types';

const base: AffinityRowData = {
  condition: AffinityCondition.Preferred,
  id: '1',
  type: AffinityType.Pod,
  weight: 50,
};

describe('PreferredAffinityWeightInput', () => {
  it('marks invalid weight and disables submit', () => {
    const setSubmitDisabled = jest.fn();

    render(
      <PreferredAffinityWeightInput
        focusedAffinity={{ ...base, weight: 0 }}
        setFocusedAffinity={jest.fn()}
        setSubmitDisabled={setSubmitDisabled}
      />,
    );

    expect(setSubmitDisabled).toHaveBeenCalledWith(true);
    expect(screen.getByText(WEIGHT_FIELD_HELP_TEXT)).toBeInTheDocument();
  });

  it('updates weight and enables submit for valid values', () => {
    const setFocusedAffinity = jest.fn();
    const setSubmitDisabled = jest.fn();

    render(
      <PreferredAffinityWeightInput
        focusedAffinity={base}
        setFocusedAffinity={setFocusedAffinity}
        setSubmitDisabled={setSubmitDisabled}
      />,
    );

    expect(setSubmitDisabled).toHaveBeenCalledWith(false);

    fireEvent.change(screen.getByTestId('affinity-weight-input'), { target: { value: '75' } });

    expect(setFocusedAffinity).toHaveBeenCalledWith({ ...base, weight: 75 });
  });
});
