import * as React from 'react';
import withQueryClient from 'src/components/QueryClientHoc';

import ProvidersPage from './ProvidersPage';

const ProvidersWrapper: React.FC = withQueryClient(ProvidersPage);
ProvidersWrapper.displayName = 'ProvidersWrapper';

export default ProvidersWrapper;
