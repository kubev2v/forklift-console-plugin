import { withQueryClient } from '@kubev2v/common/components/QueryClientHoc';
import { PlanWizard } from '@kubev2v/legacy/Plans/components/Wizard/PlanWizard';

const PlanWizardWrapper = withQueryClient(PlanWizard);
PlanWizardWrapper.displayName = 'PlanWizardWrapper';

export default PlanWizardWrapper;
