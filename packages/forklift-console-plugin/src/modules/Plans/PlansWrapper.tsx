import React from 'react';
import { ResourceConsolePageProps } from 'src/utils/types';

import { withQueryClient } from '@kubev2v/common';
import {
  MustGatherContextProvider,
  NotificationContextProvider,
} from '@kubev2v/legacy/common/context';

import PlansPage from './PlansPage';

const PlansWrapper = withQueryClient((props: ResourceConsolePageProps) => (
  <NotificationContextProvider>
    <MustGatherContextProvider>
      <PlansPage {...props} />
    </MustGatherContextProvider>
  </NotificationContextProvider>
));
PlansWrapper.displayName = 'PlansWrapper';

export default PlansWrapper;
