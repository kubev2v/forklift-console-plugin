import { withQueryClient } from '@kubev2v/common';

import StorageMappingsPage from './StorageMappingsPage';

const StorageMappingsWrapper = withQueryClient(StorageMappingsPage);
StorageMappingsWrapper.displayName = 'StorageMappingsWrapper';

export default StorageMappingsWrapper;
