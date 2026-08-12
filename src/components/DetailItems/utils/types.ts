import type { ReactNode } from 'react';

import type { K8sResourceCommon } from '@forklift-ui/types';

export type ResourceDetailsItemProps = {
  helpContent?: ReactNode;
  moreInfoLink?: string;
  resource: K8sResourceCommon;
  title?: string;
};
