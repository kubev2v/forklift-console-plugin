import * as React from 'react';
import withQueryClient from 'src/components/QueryClientHoc';

import { MustGatherContextProvider } from '@app/common/context';
import {
  VMMigrationDetails,
  VMMigrationDetailsProps,
} from '@app/Plans/components/VMMigrationDetails';

const Page = withQueryClient((props: VMMigrationDetailsProps) => (
  <MustGatherContextProvider>
    <VMMigrationDetails match={props.match} />
  </MustGatherContextProvider>
));

export default Page;
