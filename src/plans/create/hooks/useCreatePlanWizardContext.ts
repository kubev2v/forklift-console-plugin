import { useContext } from 'react';

import { CreatePlanWizardContext } from '../constants';
import type { CreatePlanWizardContextProps } from '../types';

/**
 * Hook to access the CreatePlanWizard context
 * @returns Context containing network data for source and target providers
 */
export const useCreatePlanWizardContext = (): CreatePlanWizardContextProps =>
  useContext(CreatePlanWizardContext);
