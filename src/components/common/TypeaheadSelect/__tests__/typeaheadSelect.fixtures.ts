import type { TypeaheadSelectOption } from '../utils/types';

export const mockOnChange = jest.fn();
export const mockOnInputChange = jest.fn();

const mockOptions: TypeaheadSelectOption[] = [
  { content: 'Option 1', value: 'option1' },
  { content: 'Option 2', value: 'option2' },
  { content: 'Option 3', value: 'option3' },
];

export const defaultProps = {
  onChange: mockOnChange,
  options: mockOptions,
};
