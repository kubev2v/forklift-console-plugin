import type { ReactNode } from 'react';

import type { V1beta1StorageMap } from '@kubev2v/types';

export type StorageDetailsItemProps = {
  resource: V1beta1StorageMap;
  canPatch?: boolean;
  moreInfoLink?: string;
  helpContent?: ReactNode;
};
