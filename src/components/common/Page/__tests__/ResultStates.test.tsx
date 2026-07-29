import { fireEvent, render, screen } from '@testing-library/react';

import { NoResultsMatchFilter } from '../PageStates';

test('NoResultsMatchFilter', () => {
  const clear = jest.fn();
  const { asFragment } = render(<NoResultsMatchFilter clearAllFilters={clear} />);
  const firstRender = asFragment();

  expect(firstRender).toMatchSnapshot();

  fireEvent.click(screen.getByRole('button'));

  expect(clear).toBeCalledTimes(1);
});
