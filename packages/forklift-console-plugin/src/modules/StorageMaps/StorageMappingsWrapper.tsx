import withQueryClient from 'common/src/components/QueryClientHoc';
import { withModalProvider } from 'common/src/polyfills/sdk-shim';

import StorageMappingsPage from './StorageMappingsPage';

const StorageMappingsWrapper = withModalProvider(withQueryClient(StorageMappingsPage));
StorageMappingsWrapper.displayName = 'StorageMappingsWrapper';

export default StorageMappingsWrapper;
