import withQueryClient from 'src/components/QueryClientHoc';

import { HostsPage } from '@app/Providers/HostsPage';

const HostsPageWrapper = withQueryClient(HostsPage);
HostsPageWrapper.displayName = 'HostsPageWrapper';

export default HostsPageWrapper;
