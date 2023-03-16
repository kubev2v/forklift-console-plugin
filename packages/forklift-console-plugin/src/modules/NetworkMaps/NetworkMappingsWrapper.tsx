import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { withModalProvider } from '@kubev2v/common/polyfills/sdk-shim';

import { NetworkMappingsPage } from './NetworkMappingsPage';

const NetworkMappingsWrapper = withModalProvider(withQueryClient(NetworkMappingsPage));
NetworkMappingsWrapper.displayName = 'NetworkMappingsWrapper';

export default NetworkMappingsWrapper;
