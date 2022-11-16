import withQueryClient from 'src/components/QueryClientHoc';

import { HostsPage } from '@app/Providers/HostsPage';

const Page = withQueryClient(HostsPage);

export default Page;
