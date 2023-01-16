import withQueryClient from 'src/components/QueryClientHoc';

import ProvidersPage from './ProvidersPage';

const ProvidersWrapper = withQueryClient(ProvidersPage);
ProvidersWrapper.displayName = 'ProvidersWrapper';

export default ProvidersWrapper;
