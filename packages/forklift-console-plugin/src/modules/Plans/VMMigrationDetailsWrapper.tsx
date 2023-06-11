import * as React from 'react';

import { withQueryClient } from '@kubev2v/common';
import {
  MustGatherContextProvider,
  NotificationContextProvider,
} from '@kubev2v/legacy/common/context';
import {
  VMMigrationDetails,
  VMMigrationDetailsProps,
} from '@kubev2v/legacy/Plans/components/VMMigrationDetails';

const VMMigrationDetailsWrapper = withQueryClient((props: VMMigrationDetailsProps) => (
  <NotificationContextProvider>
    <MustGatherContextProvider>
      <VMMigrationDetails match={props.match} />
    </MustGatherContextProvider>
  </NotificationContextProvider>
));
VMMigrationDetailsWrapper.displayName = 'VMMigrationDetailsWrapper';

export default VMMigrationDetailsWrapper;
