import type { FC } from 'react';
import { VSphereEndpointType } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { getSdkEndpoint, getType } from '@utils/crds/common/selectors';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import {
  ec2CredentialsFields,
  esxiCredentialsFields,
  hypervCredentialsFields,
  nutanixCredentialsFields,
  openshiftCredentialsFields,
  ovirtCredentialsFields,
  vCenterCredentialsFields,
} from './utils/standardProviderCredentialsFields';
import CredentialFields from './CredentialFields';
import OpenstackCredentialsContent from './OpenstackCredentialsContent';

type CredentialsContentProps = {
  provider: V1beta1Provider;
  reveal: boolean;
  secret: IoK8sApiCoreV1Secret;
};

const CredentialsContent: FC<CredentialsContentProps> = ({ provider, reveal, secret }) => {
  const providerType = getType(provider) as (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];
  const sdkEndpoint =
    (getSdkEndpoint(provider) as VSphereEndpointType) ?? VSphereEndpointType.VCenter;

  switch (providerType) {
    case PROVIDER_TYPES.ec2:
      return <CredentialFields fields={ec2CredentialsFields} reveal={reveal} secret={secret} />;

    case PROVIDER_TYPES.vsphere:
      if (sdkEndpoint === VSphereEndpointType.ESXi) {
        return <CredentialFields fields={esxiCredentialsFields} reveal={reveal} secret={secret} />;
      }

      return <CredentialFields fields={vCenterCredentialsFields} reveal={reveal} secret={secret} />;

    case PROVIDER_TYPES.ovirt:
      return <CredentialFields fields={ovirtCredentialsFields} reveal={reveal} secret={secret} />;

    case PROVIDER_TYPES.openshift:
      return (
        <CredentialFields fields={openshiftCredentialsFields} reveal={reveal} secret={secret} />
      );

    case PROVIDER_TYPES.openstack:
      return <OpenstackCredentialsContent reveal={reveal} secret={secret} />;

    case PROVIDER_TYPES.hyperv:
      return <CredentialFields fields={hypervCredentialsFields} reveal={reveal} secret={secret} />;

    case PROVIDER_TYPES.nutanix:
      return <CredentialFields fields={nutanixCredentialsFields} reveal={reveal} secret={secret} />;

    case PROVIDER_TYPES.ova:
    case undefined:
    default:
      return null;
  }
};

export default CredentialsContent;
