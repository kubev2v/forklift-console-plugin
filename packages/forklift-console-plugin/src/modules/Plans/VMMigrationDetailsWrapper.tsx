import * as React from 'react';

import { withQueryClient } from '@kubev2v/common/components/QueryClientHoc';
import { withModalProvider } from '@kubev2v/common/polyfills/sdk-shim';
import {
  MustGatherContextProvider,
  NotificationContextProvider,
} from '@kubev2v/legacy/common/context';
import {
  VMMigrationDetails,
  VMMigrationDetailsProps,
} from '@kubev2v/legacy/Plans/components/VMMigrationDetails';

const VMMigrationDetailsWrapper = withQueryClient(
  withModalProvider((props: VMMigrationDetailsProps) => (
    <NotificationContextProvider>
      <MustGatherContextProvider>
        <VMMigrationDetails match={props.match} />
      </MustGatherContextProvider>
    </NotificationContextProvider>
  )),
);
VMMigrationDetailsWrapper.displayName = 'VMMigrationDetailsWrapper';

export default VMMigrationDetailsWrapper;
