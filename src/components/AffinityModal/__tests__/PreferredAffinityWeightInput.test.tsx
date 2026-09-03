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

import PreferredAffinityWeightInput from '../PreferredAffinityWeightInput';
import { AffinityCondition, type AffinityRowData, AffinityType } from '../utils/types';

const base: AffinityRowData = {
  condition: AffinityCondition.Preferred,
  id: '1',
  type: AffinityType.Pod,
  weight: 50,
};

describe('PreferredAffinityWeightInput', () => {
  it.each([0, 101, Number.NaN])(
    'marks weight %p invalid via aria-invalid and error helper',
    (weight) => {
      render(
        <PreferredAffinityWeightInput
          focusedAffinity={{ ...base, weight }}
          setFocusedAffinity={jest.fn()}
        />,
      );

      expect(screen.getByTestId('affinity-weight-input')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByTestId('form-helper-text-error')).toBeInTheDocument();
    },
  );

  it.each([1, 100])('marks weight %p valid', (weight) => {
    render(
      <PreferredAffinityWeightInput
        focusedAffinity={{ ...base, weight }}
        setFocusedAffinity={jest.fn()}
      />,
    );

    expect(screen.getByTestId('affinity-weight-input')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByTestId('form-helper-text-error')).not.toBeInTheDocument();
  });

  it('updates weight on change', async () => {
    const user = userEvent.setup();
    const setFocusedAffinity = jest.fn();

    render(
      <PreferredAffinityWeightInput
        focusedAffinity={base}
        setFocusedAffinity={setFocusedAffinity}
      />,
    );

    await user.clear(screen.getByTestId('affinity-weight-input'));
    await user.type(screen.getByTestId('affinity-weight-input'), '75');

    expect(setFocusedAffinity).toHaveBeenCalledWith(
      expect.objectContaining({ weight: expect.any(Number) }),
    );
  });
});
