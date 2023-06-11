import { withQueryClient } from '@kubev2v/common';

import { NetworkMappingsPage } from './NetworkMappingsPage';

const NetworkMappingsWrapper = withQueryClient(NetworkMappingsPage);
NetworkMappingsWrapper.displayName = 'NetworkMappingsWrapper';

export default NetworkMappingsWrapper;
