import * as React from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';

import { NoResultsMatchFilter } from '../ResultStates';

afterEach(cleanup);

test('NoResultsMatchFilter', async () => {
  const clear = jest.fn();
  const { asFragment, getByRole } = render(<NoResultsMatchFilter clearAllFilters={clear} />);
  const firstRender = asFragment();

  expect(firstRender).toMatchSnapshot();

  fireEvent.click(getByRole('button'));

  expect(clear).toBeCalledTimes(1);
});
