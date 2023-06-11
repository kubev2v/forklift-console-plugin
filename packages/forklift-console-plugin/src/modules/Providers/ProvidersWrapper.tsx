import { withQueryClient } from '@kubev2v/common';

import ProvidersPage from './ProvidersPage';

const ProvidersWrapper = withQueryClient(ProvidersPage);
ProvidersWrapper.displayName = 'ProvidersWrapper';

export default ProvidersWrapper;
