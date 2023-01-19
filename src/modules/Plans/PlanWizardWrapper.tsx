import withQueryClient from 'src/components/QueryClientHoc';

import { PlanWizard } from '@app/Plans/components/Wizard/PlanWizard';
import { withModalProvider } from '@shim/dynamic-plugin-sdk';

const PlanWizardWrapper = withQueryClient(withModalProvider(PlanWizard));
PlanWizardWrapper.displayName = 'PlanWizardWrapper';

export default PlanWizardWrapper;
