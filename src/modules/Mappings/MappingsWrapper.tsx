import withQueryClient from 'src/components/QueryClientHoc';

import { MappingsPage } from '@app/Mappings/MappingsPage';

const Page = withQueryClient(MappingsPage);

export default Page;
