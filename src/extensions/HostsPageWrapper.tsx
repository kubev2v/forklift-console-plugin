import { HostsPage } from '@app/Providers/HostsPage';

import withQueryClient from './QueryClientHoc';

const Page = withQueryClient(HostsPage);

export default Page;
