import React from 'react';
import withQueryClient from 'src/components/QueryClientHoc';

import { MustGatherContextProvider } from '@app/common/context';

import PlansPage from './PlansPage';

const Page = withQueryClient((props) => (
  <MustGatherContextProvider>
    <PlansPage {...props} />
  </MustGatherContextProvider>
));

export default Page;
