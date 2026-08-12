import type { FC } from 'react';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { DescriptionList } from '@patternfly/react-core';

import CredentialContent from './CredentialContent';
type CredentialsSectionProps = {
  provider: V1beta1Provider;
  reveal: boolean;
  secret: IoK8sApiCoreV1Secret;
};

const CredentialsSection: FC<CredentialsSectionProps> = ({ provider, reveal, secret }) => {
  return (
    <DescriptionList>
      <CredentialContent provider={provider} reveal={reveal} secret={secret} />
    </DescriptionList>
  );
};

export default CredentialsSection;
