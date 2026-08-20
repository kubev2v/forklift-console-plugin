import type { FC } from 'react';

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { InputList } from '../InputList';

const TestRow: FC<{ onChange: (value: string) => void; value: string }> = ({ onChange, value }) => (
  <input
    aria-label="passphrase"
    onChange={(event) => {
      onChange(event.target.value);
    }}
    value={value ?? ''}
  />
);

describe('InputList', () => {
  it('renders items provided on first mount', () => {
    render(<InputList InputRow={TestRow} items={['asdasd']} onChange={jest.fn()} />);

    expect(screen.getByRole('textbox', { name: 'passphrase' })).toHaveValue('asdasd');
  });

  it('hydrates rows when items arrive after an empty first render', () => {
    const { rerender } = render(<InputList InputRow={TestRow} items={[]} onChange={jest.fn()} />);

    expect(screen.getByRole('textbox', { name: 'passphrase' })).toHaveValue('');

    rerender(<InputList InputRow={TestRow} items={['asdasd']} onChange={jest.fn()} />);

    expect(screen.getByRole('textbox', { name: 'passphrase' })).toHaveValue('asdasd');
  });
});
