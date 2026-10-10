/* eslint-disable react-refresh/only-export-components -- scope context is read by table cells */
import { createContext, type FC, type ReactNode, useContext, useMemo } from 'react';

type DataViewCellScopeValue = {
  columnId: string;
};

const DataViewCellScopeContext = createContext<DataViewCellScopeValue | null>(null);

type DataViewCellScopeProviderProps = {
  children: ReactNode;
  columnId: string;
};

export const DataViewCellScopeProvider: FC<DataViewCellScopeProviderProps> = ({
  children,
  columnId,
}) => {
  const value = useMemo(() => ({ columnId }), [columnId]);
  return (
    <DataViewCellScopeContext.Provider value={value}>{children}</DataViewCellScopeContext.Provider>
  );
};

export const useDataViewCellScope = (): DataViewCellScopeValue | null =>
  useContext(DataViewCellScopeContext);
