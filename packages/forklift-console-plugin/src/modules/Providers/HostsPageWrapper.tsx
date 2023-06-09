import { withQueryClient } from '@kubev2v/common/components/QueryClientHoc';
import { HostsPage } from '@kubev2v/legacy/Providers/HostsPage';

const HostsPageWrapper = withQueryClient(HostsPage);
HostsPageWrapper.displayName = 'HostsPageWrapper';

export default HostsPageWrapper;
