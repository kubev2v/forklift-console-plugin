import { ReactNode } from 'react';

import { V1beta1Plan } from '@kubev2v/types';

export interface PlanDetailsItemProps {
  resource: V1beta1Plan;
  canPatch?: boolean;
  moreInfoLink?: string;
  helpContent?: ReactNode;
}
