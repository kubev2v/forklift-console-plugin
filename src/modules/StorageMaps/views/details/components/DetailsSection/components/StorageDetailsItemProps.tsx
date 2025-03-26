import { ReactNode } from 'react';

import { V1beta1StorageMap } from '@kubev2v/types';

export interface StorageDetailsItemProps {
  resource: V1beta1StorageMap;
  canPatch?: boolean;
  moreInfoLink?: string;
  helpContent?: ReactNode;
}
