import * as React from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

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

const withQueryClient = (Component) =>
  function QueryClientHoc(props) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
        {process.env.NODE_ENV !== 'test' ? <ReactQueryDevtools /> : null}
      </QueryClientProvider>
    );
  };

export default withQueryClient;
