import * as React from 'react';
import withQueryClient from 'src/components/QueryClientHoc';

import { MustGatherContextProvider } from '@app/common/context';
import {
  VMMigrationDetails,
  VMMigrationDetailsProps,
} from '@app/Plans/components/VMMigrationDetails';
import { withModalProvider } from '@shim/dynamic-plugin-sdk';

const VMMigrationDetailsWrapper = withQueryClient(
  withModalProvider((props: VMMigrationDetailsProps) => (
    <MustGatherContextProvider>
      <VMMigrationDetails match={props.match} />
    </MustGatherContextProvider>
  )),
);
VMMigrationDetailsWrapper.displayName = 'VMMigrationDetailsWrapper';

export default VMMigrationDetailsWrapper;
