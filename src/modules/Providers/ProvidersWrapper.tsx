import withQueryClient from 'src/components/QueryClientHoc';

import { withModalProvider } from '@shim/dynamic-plugin-sdk';

import ProvidersPage from './ProvidersPage';

const ProvidersWrapper = withQueryClient(withModalProvider(ProvidersPage));
ProvidersWrapper.displayName = 'ProvidersWrapper';

export default ProvidersWrapper;
