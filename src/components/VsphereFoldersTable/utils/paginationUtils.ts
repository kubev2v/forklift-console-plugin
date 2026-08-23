import type { OnSetPage } from '@patternfly/react-core';

export const snapPageToValidRange = (
  itemCount: number,
  onSetPage: OnSetPage,
  page: number,
  perPage: number,
): void => {
  const maxPage = Math.max(1, Math.ceil(itemCount / perPage));
  if (page > maxPage) {
    onSetPage({} as MouseEvent, 1);
  }
};
