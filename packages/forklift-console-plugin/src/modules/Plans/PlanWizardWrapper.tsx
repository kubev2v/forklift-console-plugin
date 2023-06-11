import { withQueryClient } from '@kubev2v/common';
import { PlanWizard } from '@kubev2v/legacy/Plans/components/Wizard/PlanWizard';

const PlanWizardWrapper = withQueryClient(PlanWizard);
PlanWizardWrapper.displayName = 'PlanWizardWrapper';

export default PlanWizardWrapper;
