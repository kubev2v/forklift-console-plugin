import type { ReactElement, ReactNode } from 'react';

import type { OnPerPageSelect, OnSetPage } from '@patternfly/react-core';
import { PageSection, Pagination } from '@patternfly/react-core';

type PageContentProps = {
  children: ReactNode;
  itemsPerPage: number;
  noPadding?: boolean;
  onPerPageSelect: OnPerPageSelect;
  onSetPage: OnSetPage;
  page: number;
  showPagination: boolean;
  toolbar: ReactNode;
  totalItems: number;
};

export const PageContent = ({
  children,
  itemsPerPage,
  noPadding,
  onPerPageSelect,
  onSetPage,
  page,
  showPagination,
  toolbar,
  totalItems,
}: PageContentProps): ReactElement => (
  <PageSection hasBodyWrapper={false} padding={{ default: noPadding ? 'noPadding' : 'padding' }}>
    {toolbar}
    {children}
    {showPagination && (
      <Pagination
        itemCount={totalItems}
        onPerPageSelect={onPerPageSelect}
        onSetPage={onSetPage}
        page={page}
        perPage={itemsPerPage}
        variant="bottom"
      />
    )}
  </PageSection>
);
