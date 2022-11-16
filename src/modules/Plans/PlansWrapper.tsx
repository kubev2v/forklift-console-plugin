import React from 'react';
import withQueryClient from 'src/components/QueryClientHoc';

import { MustGatherContextProvider } from '@app/common/context';
import { PlansPage } from '@app/Plans/PlansPage';

const Page = withQueryClient(() => (
  <MustGatherContextProvider>
    <PlansPage />
  </MustGatherContextProvider>
));

export default Page;
