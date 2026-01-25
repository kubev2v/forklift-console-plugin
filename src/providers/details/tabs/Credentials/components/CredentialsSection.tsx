import type { FC } from 'react';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { DescriptionList } from '@patternfly/react-core';

import CredentialContent from './CredentialContent';
type CredentialsSectionProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
  reveal: boolean;
};

const CredentialsSection: FC<CredentialsSectionProps> = ({ provider, reveal, secret }) => {
  return (
    <DescriptionList>
      <CredentialContent provider={provider} secret={secret} reveal={reveal} />
    </DescriptionList>
  );
};

export default CredentialsSection;
