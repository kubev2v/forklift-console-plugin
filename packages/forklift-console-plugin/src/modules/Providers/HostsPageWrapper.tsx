import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { withModalProvider } from '@kubev2v/common/polyfills/sdk-shim';
import { HostsPage } from '@kubev2v/legacy/Providers/HostsPage';

const HostsPageWrapper = withQueryClient(withModalProvider(HostsPage));
HostsPageWrapper.displayName = 'HostsPageWrapper';

export default HostsPageWrapper;
