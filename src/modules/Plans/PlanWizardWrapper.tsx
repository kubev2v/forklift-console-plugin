import withQueryClient from 'src/components/QueryClientHoc';

import { PlanWizard } from '@app/Plans/components/Wizard/PlanWizard';

const Page = withQueryClient(PlanWizard);

export default Page;
