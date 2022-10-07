import React from 'react';

import { MustGatherContextProvider } from '@app/common/context';
import { PlansPage } from '@app/Plans/PlansPage';

import withQueryClient from './QueryClientHoc';

const Page = withQueryClient(() => (
  <MustGatherContextProvider>
    <PlansPage />
  </MustGatherContextProvider>
));

export default Page;
