import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { withModalProvider } from '@kubev2v/common/polyfills/sdk-shim';

import ProvidersPage from './ProvidersPage';

const ProvidersWrapper = withQueryClient(withModalProvider(ProvidersPage));
ProvidersWrapper.displayName = 'ProvidersWrapper';

export default ProvidersWrapper;
