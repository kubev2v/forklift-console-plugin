import withQueryClient from 'common/src/components/QueryClientHoc';
import { withModalProvider } from 'common/src/polyfills/sdk-shim';

import { NetworkMappingsPage } from './NetworkMappingsPage';

const NetworkMappingsWrapper = withModalProvider(withQueryClient(NetworkMappingsPage));
NetworkMappingsWrapper.displayName = 'NetworkMappingsWrapper';

export default NetworkMappingsWrapper;
