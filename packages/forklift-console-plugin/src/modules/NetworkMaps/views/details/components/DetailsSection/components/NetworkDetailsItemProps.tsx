import { ReactNode } from 'react';

import { V1beta1NetworkMap } from '@kubev2v/types';

export interface NetworkDetailsItemProps {
  resource: V1beta1NetworkMap;
  canPatch?: boolean;
  moreInfoLink?: string;
  helpContent?: ReactNode;
}
