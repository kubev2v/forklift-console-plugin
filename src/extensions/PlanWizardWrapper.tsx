import { PlanWizard } from '@app/Plans/components/Wizard/PlanWizard';

import withQueryClient from './QueryClientHoc';

const Page = withQueryClient(PlanWizard);

export default Page;
