import React from 'react';
import { ResourceConsolePageProps } from '_/utils/types';
import withQueryClient from 'src/components/QueryClientHoc';

import { MustGatherContextProvider } from '@app/common/context';
import { withModalProvider } from '@shim/dynamic-plugin-sdk';

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
