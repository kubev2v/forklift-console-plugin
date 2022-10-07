import { MappingsPage } from '@app/Mappings/MappingsPage';

import withQueryClient from './QueryClientHoc';

const Page = withQueryClient(MappingsPage);

export default Page;
