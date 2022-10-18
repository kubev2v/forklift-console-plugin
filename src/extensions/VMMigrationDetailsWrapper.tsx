import * as React from 'react';

import { MustGatherContextProvider } from '@app/common/context';
import {
  VMMigrationDetails,
  VMMigrationDetailsProps,
} from '@app/Plans/components/VMMigrationDetails';

import withQueryClient from './QueryClientHoc';

const Page = withQueryClient((props: VMMigrationDetailsProps) => (
  <MustGatherContextProvider>
    <VMMigrationDetails match={props.match} />
  </MustGatherContextProvider>
));

export default Page;
