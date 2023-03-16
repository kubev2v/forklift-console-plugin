import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { withModalProvider } from '@kubev2v/common/polyfills/sdk-shim';

import StorageMappingsPage from './StorageMappingsPage';

const StorageMappingsWrapper = withModalProvider(withQueryClient(StorageMappingsPage));
StorageMappingsWrapper.displayName = 'StorageMappingsWrapper';

export default StorageMappingsWrapper;
