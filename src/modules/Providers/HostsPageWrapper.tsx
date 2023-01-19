import withQueryClient from 'src/components/QueryClientHoc';

import { HostsPage } from '@app/Providers/HostsPage';
import { withModalProvider } from '@shim/dynamic-plugin-sdk';

const HostsPageWrapper = withQueryClient(withModalProvider(HostsPage));
HostsPageWrapper.displayName = 'HostsPageWrapper';

export default HostsPageWrapper;
