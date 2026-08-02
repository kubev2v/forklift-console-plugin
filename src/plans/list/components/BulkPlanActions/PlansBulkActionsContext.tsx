import { createContext } from 'react';

import type { V1beta1Plan } from '@forklift-ui/types';

export type PlansBulkActionsContextValue = {
  plans: V1beta1Plan[];
  canPatch: boolean;
  canDelete: boolean;
  onComplete: () => void;
};

export const PlansBulkActionsContext = createContext<PlansBulkActionsContextValue>({
  canDelete: false,
  canPatch: false,
  onComplete: () => undefined,
  plans: [],
});
