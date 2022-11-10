import GenericEmptyDetailPage from 'src/extensions/GenericEmptyDetailPage';

import withQueryClient from './QueryClientHoc';

const Page = withQueryClient(GenericEmptyDetailPage);

export default Page;
