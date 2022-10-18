import { ProvidersPage } from '@app/Providers/ProvidersPage';

import withQueryClient from './QueryClientHoc';

const Page = withQueryClient(ProvidersPage);

export default Page;
