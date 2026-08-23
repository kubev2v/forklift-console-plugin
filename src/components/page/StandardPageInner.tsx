import { type ComponentProps, type ReactElement, useMemo } from 'react';

import { useFields } from '@components/common/Page/useFields';
import { DefaultHeader } from '@components/common/TableView/DefaultHeader';
import { DefaultRow } from '@components/common/TableView/DefaultRow';
import type { TableSortContextProps } from '@components/TableSortContext';

import StandardPageInnerView from './components/StandardPageInnerView';
import { usePageData } from './hooks/usePageData';
import { usePageFilters } from './hooks/usePageFilters';
import { usePagination } from './hooks/usePagination';
import { useStandardPageInnerData } from './hooks/useStandardPageInnerData';
import type StandardPage from './StandardPage';

import './StandardPage.style.css';

type StandardPageInnerProps<T> = Omit<ComponentProps<typeof StandardPage<T>>, 'pageRef'> &
  TableSortContextProps &
  Required<Pick<ComponentProps<typeof StandardPage<T>>, 'pageRef'>>;

const EMPTY_GLOBAL_ACTION_TOOLBAR_ITEMS: never[] = [];

const StandardPageInner = <T,>(props: StandardPageInnerProps<T>): ReactElement => {
  const {
    canSelect,
    cell,
    dataSource: [flatData, loaded, error],
    expanded,
    extraSupportedFilters,
    extraSupportedMatchers,
    fieldsMetadata,
    GlobalActionToolbarItems = EMPTY_GLOBAL_ACTION_TOOLBAR_ITEMS,
    header = DefaultHeader<T>,
    namespace = '',
    page: initialPage = 1,
    pageRef,
    pagination,
    postFilterData,
    row = DefaultRow<T>,
    userSettings,
    ...viewProps
  } = props;

  const { clearAllFilters, metaMatcher, selectedFilters, setSelectedFilters, supportedFilters } =
    usePageFilters({
      extraSupportedFilters,
      extraSupportedMatchers,
      fieldsMetadata,
      userSettings,
    });

  const defaultFieldsWithoutFilters = useMemo(
    () => fieldsMetadata.filter(({ isForFilterOnly }) => !isForFilterOnly),
    [fieldsMetadata],
  );

  const [fields, setFields] = useFields(
    namespace,
    defaultFieldsWithoutFilters,
    userSettings?.fields,
  );

  const { finalFilteredData, sortedData } = usePageData({
    compareFn: viewProps.compareFn,
    error,
    fields,
    flatData,
    loaded,
    metaMatcher,
    postFilterData,
    selectedFilters,
  });

  const { itemsPerPage, onPerPageSelect, onSetPage, page, pageData, showPagination } =
    usePagination({
      finalFilteredData,
      initialPage,
      pageRef,
      pagination,
      selectedFilters,
      sortedDataLength: sortedData.length,
      userSettings: userSettings?.pagination,
    });

  const innerData = useStandardPageInnerData({
    canSelect,
    cell,
    expanded,
    fields,
    finalFilteredData,
    GlobalActionToolbarItems,
    pageData,
    row,
    showPagination,
    toId: viewProps.toId,
  });

  return (
    <StandardPageInnerView
      {...viewProps}
      clearAllFilters={clearAllFilters}
      defaultFieldsWithoutFilters={defaultFieldsWithoutFilters}
      error={error}
      fields={fields}
      fieldsMetadata={fieldsMetadata}
      finalFilteredData={finalFilteredData}
      flatData={flatData}
      header={header}
      itemsPerPage={itemsPerPage}
      loaded={loaded}
      namespace={namespace}
      onPerPageSelect={onPerPageSelect}
      onSetPage={onSetPage}
      page={page}
      selectedFilters={selectedFilters}
      setFields={setFields}
      setSelectedFilters={setSelectedFilters}
      showPagination={showPagination}
      sortedData={sortedData}
      supportedFilters={supportedFilters}
      {...innerData}
    />
  );
};

export default StandardPageInner;
