import type { ReactNode } from 'react';

import type { OnPerPageSelect, OnSetPage } from '@patternfly/react-core';
import { PageSection, Pagination } from '@patternfly/react-core';

type PageContentProps = {
  toolbar: ReactNode;
  children: ReactNode;
  showPagination: boolean;
  page: number;
  itemsPerPage: number;
  totalItems: number;
  onSetPage: OnSetPage;
  onPerPageSelect: OnPerPageSelect;
  noPadding?: boolean;
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
}: PageContentProps) => (
  <PageSection hasBodyWrapper={false} padding={{ default: noPadding ? 'noPadding' : 'padding' }}>
    {toolbar}
    {children}
    {showPagination && (
      <Pagination
        variant="bottom"
        perPage={itemsPerPage}
        page={page}
        itemCount={totalItems}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
    )}
  </PageSection>
);
