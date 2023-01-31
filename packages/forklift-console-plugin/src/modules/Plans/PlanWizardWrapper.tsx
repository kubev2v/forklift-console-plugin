import withQueryClient from '@kubev2v/common/components/QueryClientHoc';
import { withModalProvider } from '@kubev2v/common/polyfills/sdk-shim';
import { PlanWizard } from '@kubev2v/legacy/Plans/components/Wizard/PlanWizard';

const PlanWizardWrapper = withQueryClient(withModalProvider(PlanWizard));
PlanWizardWrapper.displayName = 'PlanWizardWrapper';

export default PlanWizardWrapper;
