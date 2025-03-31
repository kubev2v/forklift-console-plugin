import React from 'react';

import type { V1beta1Provider } from '@kubev2v/types';
import { ResourceStatus } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';

export const ProviderCardTitle: React.FC<ProviderCardTitleProps> = ({ provider }) => {
  return (
    <>
      {provider.metadata.name}
      <ResourceStatus additionalClassNames="hidden-xs">
        <Status status={provider.status.phase} />
      </ResourceStatus>
    </>
  );
};

export type ProviderCardTitleProps = {
  provider: V1beta1Provider;
};
