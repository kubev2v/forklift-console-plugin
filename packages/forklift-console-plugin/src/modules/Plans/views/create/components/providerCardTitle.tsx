import React from 'react';

import { V1beta1Provider } from '@kubev2v/types';
import { ResourceStatus } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Flex, FlexItem } from '@patternfly/react-core';

export const ProviderCardTitle: React.FC<ProviderCardTitleProps> = ({ provider }) => {
  return (
    <Flex>
      <FlexItem>{provider.metadata.name}</FlexItem>
      <FlexItem align={{ default: 'alignRight' }}>
        <ResourceStatus additionalClassNames="hidden-xs">
          <Status status={provider.status.phase} />
        </ResourceStatus>
      </FlexItem>
    </Flex>
  );
};

export type ProviderCardTitleProps = {
  provider: V1beta1Provider;
};
