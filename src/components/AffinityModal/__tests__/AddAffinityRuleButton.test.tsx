import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import AddAffinityRuleButton from '../AddAffinityRuleButton';

describe('AddAffinityRuleButton', () => {
  it('renders secondary button by default and invokes callback', async () => {
    const user = userEvent.setup();
    const onAffinityClickAdd = jest.fn();

    render(<AddAffinityRuleButton onAffinityClickAdd={onAffinityClickAdd} />);

    const button = screen.getByTestId('add-affinity-rule-button');
    expect(button).toHaveTextContent('Add affinity rule');
    await user.click(button);
    expect(onAffinityClickAdd).toHaveBeenCalledTimes(1);
  });

  it('renders as a link button when isLinkButton is true', () => {
    render(<AddAffinityRuleButton isLinkButton onAffinityClickAdd={jest.fn()} />);

    const linkButton = screen.getByTestId('add-affinity-rule-button');
    expect(linkButton.className).toContain('pf-m-link');
  });

  it('does not use the link variant by default', () => {
    render(<AddAffinityRuleButton onAffinityClickAdd={jest.fn()} />);

    expect(screen.getByTestId('add-affinity-rule-button').className).not.toContain('pf-m-link');
  });
});
