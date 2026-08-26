import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { AttributeKind } from '../../utils/types';
import FilterAttributeSelect from '../FilterAttributeSelect';

const attributes = [
  { id: 'name', kind: AttributeKind.Text, label: 'VM name' },
  { id: 'host', kind: AttributeKind.Checkbox, label: 'Host', options: [] },
];

describe('FilterAttributeSelect', () => {
  it('renders the first attribute label when activeId is missing', () => {
    render(<FilterAttributeSelect attributes={attributes} onChange={jest.fn()} />);

    expect(screen.getByTestId('filter-attribute-toggle')).toHaveTextContent('VM name');
  });

  it('renders the active attribute label', () => {
    render(
      <FilterAttributeSelect activeId="host" attributes={attributes} onChange={jest.fn()} />,
    );

    expect(screen.getByTestId('filter-attribute-toggle')).toHaveTextContent('Host');
  });

  it('calls onChange with the selected attribute id', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<FilterAttributeSelect attributes={attributes} onChange={onChange} />);

    await user.click(screen.getByTestId('filter-attribute-toggle'));
    await user.click(screen.getByRole('option', { name: 'Host' }));

    expect(onChange).toHaveBeenCalledWith('host');
  });
});
