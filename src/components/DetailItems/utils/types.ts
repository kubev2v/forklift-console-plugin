import type { ReactNode } from 'react';

import type { K8sResourceCommon } from '@kubev2v/types';

export type ResourceDetailsItemProps = {
  resource: K8sResourceCommon;
  helpContent?: ReactNode;
  moreInfoLink?: string;
};
