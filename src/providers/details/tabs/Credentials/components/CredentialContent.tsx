import type { FC } from 'react';
import { PROVIDER_TYPES, VSphereEndpointType } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { getSdkEndpoint, getType } from '@utils/crds/common/selectors';

import {
  esxiCredentialsFields,
  openshiftCredentialsFields,
  ovirtCredentialsFields,
  vCenterCredentialsFields,
} from './utils/credentialsFields';
import CredentialFields from './CredentialFields';
import OpenstackCredentialsContent from './OpenstackCredentialsContent';

type CredentialsContentProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
  reveal: boolean;
};

const CredentialsContent: FC<CredentialsContentProps> = ({ provider, reveal, secret }) => {
  const providerType = getType(provider) as (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];
  const sdkEndpoint =
    (getSdkEndpoint(provider) as VSphereEndpointType) ?? VSphereEndpointType.vCenter;

  switch (providerType) {
    case PROVIDER_TYPES.vsphere:
      if (sdkEndpoint === VSphereEndpointType.ESXi) {
        return <CredentialFields fields={esxiCredentialsFields} secret={secret} reveal={reveal} />;
      }

      return <CredentialFields fields={vCenterCredentialsFields} secret={secret} reveal={reveal} />;

    case PROVIDER_TYPES.ovirt:
      return <CredentialFields fields={ovirtCredentialsFields} secret={secret} reveal={reveal} />;

    case PROVIDER_TYPES.openshift:
      return (
        <CredentialFields fields={openshiftCredentialsFields} secret={secret} reveal={reveal} />
      );

    case PROVIDER_TYPES.openstack:
      return <OpenstackCredentialsContent secret={secret} reveal={reveal} />;

    case PROVIDER_TYPES.ova:
    case undefined:
    default:
      return null;
  }
};

export default CredentialsContent;
