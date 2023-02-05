import { UnknownResult } from 'legacy/src/common/types';
import * as React from 'react';
import { ResolvedQueries, IResolvedQueriesProps } from './ResolvedQueries';

export interface IResolvedQueryProps
  extends Omit<IResolvedQueriesProps, 'results' | 'errorTitles'> {
  result: UnknownResult;
  errorTitle: string;
}

// TODO lib-ui candidate
export const ResolvedQuery: React.FunctionComponent<IResolvedQueryProps> = ({
  result,
  errorTitle,
  ...props
}: IResolvedQueryProps) => (
  <ResolvedQueries results={[result]} errorTitles={[errorTitle]} {...props} />
);
