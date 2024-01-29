import { ReactNode } from 'react';

import { V1beta1Provider } from '@kubev2v/types';

export interface ProviderDetailsItemProps {
  resource: V1beta1Provider;
  canPatch?: boolean;
  moreInfoLink?: string;
  helpContent?: ReactNode;
}
