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

import AffinityEmptyState from '../AffinityEmptyState';

describe('AffinityEmptyState', () => {
  it('renders empty heading and add action', async () => {
    const user = userEvent.setup();
    const onAffinityClickAdd = jest.fn();

    render(<AffinityEmptyState onAffinityClickAdd={onAffinityClickAdd} />);

    expect(screen.getByText('No affinity rules found')).toBeInTheDocument();
    await user.click(screen.getByTestId('add-affinity-rule-button'));
    expect(onAffinityClickAdd).toHaveBeenCalledTimes(1);
  });
});
