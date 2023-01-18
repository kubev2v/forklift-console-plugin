import withQueryClient from 'src/components/QueryClientHoc';

import { PlanWizard } from '@app/Plans/components/Wizard/PlanWizard';

const PlanWizardWrapper = withQueryClient(PlanWizard);
PlanWizardWrapper.displayName = 'PlanWizardWrapper';

export default PlanWizardWrapper;
