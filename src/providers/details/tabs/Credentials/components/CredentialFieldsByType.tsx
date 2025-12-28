import type { FC } from 'react';
import ServiceAccountTokenField from 'src/providers/create/fields/openshift/ServiceAccountTokenField';
import OpenStackAuthenticationTypeField from 'src/providers/create/fields/openstack/OpenStackAuthenticationTypeField';
import OvirtCredentialsFields from 'src/providers/create/fields/ovirt/OvirtCredentialsFields';
import VsphereCredentialsFields from 'src/providers/create/fields/vsphere/VsphereCredentialsFields';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

const CredentialFieldsByType: FC<{ providerType: string | undefined }> = ({ providerType }) => {
  switch (providerType) {
    case PROVIDER_TYPES.vsphere:
      return <VsphereCredentialsFields />;

    case PROVIDER_TYPES.ovirt:
      return <OvirtCredentialsFields />;

    case PROVIDER_TYPES.openshift:
      return <ServiceAccountTokenField />;

    case PROVIDER_TYPES.openstack:
      return <OpenStackAuthenticationTypeField />;

    case PROVIDER_TYPES.ova:
    case undefined:
    default:
      return null;
  }
};

export default CredentialFieldsByType;
