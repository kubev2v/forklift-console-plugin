import React from 'react';

import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { withModalProvider } from '@kubev2v/common/polyfills/sdk-shim';
import { ResourceConsolePageProps } from '@kubev2v/forklift-console-plugin/utils/types';
import { MustGatherContextProvider } from '@kubev2v/legacy/common/context';

import PlansPage from './PlansPage';

const PlansWrapper = withQueryClient(
  withModalProvider((props: ResourceConsolePageProps) => (
    <MustGatherContextProvider>
      <PlansPage {...props} />
    </MustGatherContextProvider>
  )),
);
PlansWrapper.displayName = 'PlansWrapper';

export default PlansWrapper;
