import withQueryClient from 'src/components/QueryClientHoc';

import { ProvidersPage } from '@app/Providers/ProvidersPage';

const Page = withQueryClient(ProvidersPage);

export default Page;
