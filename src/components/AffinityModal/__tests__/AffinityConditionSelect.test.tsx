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

import AffinityConditionSelect from '../AffinityConditionSelect';
import { AffinityCondition, AffinityType, type AffinityRowData } from '../utils/types';

const focusedAffinity: AffinityRowData = {
  condition: AffinityCondition.Required,
  id: '1',
  type: AffinityType.Node,
};

describe('AffinityConditionSelect', () => {
  it('shows the current condition label', () => {
    render(
      <AffinityConditionSelect
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={jest.fn()}
      />,
    );

    expect(screen.getByTestId('affinity-condition-select')).toHaveTextContent(
      'Required during scheduling',
    );
  });

  it('updates focused affinity condition on select', async () => {
    const user = userEvent.setup();
    const setFocusedAffinity = jest.fn();

    render(
      <AffinityConditionSelect
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
      />,
    );

    await user.click(screen.getByTestId('affinity-condition-select'));
    await user.click(screen.getByRole('option', { name: 'Preferred during scheduling' }));

    expect(setFocusedAffinity).toHaveBeenCalledWith({
      ...focusedAffinity,
      condition: AffinityCondition.Preferred,
    });
  });
});
