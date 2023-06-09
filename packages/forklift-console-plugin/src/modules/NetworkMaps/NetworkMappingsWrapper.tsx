import { withQueryClient } from '@kubev2v/common/components/QueryClientHoc';

import { NetworkMappingsPage } from './NetworkMappingsPage';

const NetworkMappingsWrapper = withQueryClient(NetworkMappingsPage);
NetworkMappingsWrapper.displayName = 'NetworkMappingsWrapper';

export default NetworkMappingsWrapper;
