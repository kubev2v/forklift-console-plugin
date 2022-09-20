import * as React from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { MustGatherContextProvider } from '@app/common/context';
import {
  VMMigrationDetails,
  VMMigrationDetailsProps,
} from '@app/Plans/components/VMMigrationDetails';

const queryCache = new QueryCache();
const queryClient = new QueryClient({
  queryCache,
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FunctionComponent = (props: VMMigrationDetailsProps) => (
  <QueryClientProvider client={queryClient}>
    <MustGatherContextProvider>
      <VMMigrationDetails match={props.match} />
      {process.env.NODE_ENV !== 'test' ? <ReactQueryDevtools /> : null}
    </MustGatherContextProvider>
  </QueryClientProvider>
);

export default App;
