import type { ReactNode } from 'react';

import type { K8sResourceCommon } from '@forklift-ui/types';

export type ResourceDetailsItemProps = {
  resource: K8sResourceCommon;
  helpContent?: ReactNode;
  moreInfoLink?: string;
  title?: string;
};
