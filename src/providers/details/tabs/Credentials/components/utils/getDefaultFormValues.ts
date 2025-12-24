import {
  CertificateValidationMode,
  ProviderFormFieldId,
} from 'src/providers/create/fields/constants';
import type { CreateProviderFormData } from 'src/providers/create/types';
import {
  type OpenstackAuthType,
  PROVIDER_TYPES,
  VSphereEndpointType,
} from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { getSdkEndpoint, getType } from '@utils/crds/common/selectors';

import { getDecodedValue } from './getDecodedValue';

export const getDefaultFormValues = (
  secret: IoK8sApiCoreV1Secret,
  provider: V1beta1Provider,
): Partial<CreateProviderFormData> => {
  const providerType = getType(provider);
  const sdkEndpoint = getSdkEndpoint(provider) as VSphereEndpointType;
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify) === 'true';

  const baseValues: Partial<CreateProviderFormData> = {
    [ProviderFormFieldId.CaCertificate]: getDecodedValue(secret?.data?.cacert) ?? '',
    [ProviderFormFieldId.CertificateValidation]: insecureSkipVerify
      ? CertificateValidationMode.Skip
      : CertificateValidationMode.Configure,
  };

  switch (providerType) {
    case PROVIDER_TYPES.vsphere:
      return {
        ...baseValues,
        [ProviderFormFieldId.VsphereEndpointType]: sdkEndpoint ?? VSphereEndpointType.vCenter,
        [ProviderFormFieldId.VspherePassword]: getDecodedValue(secret?.data?.password) ?? '',
        [ProviderFormFieldId.VsphereUsername]: getDecodedValue(secret?.data?.user) ?? '',
      };

    case PROVIDER_TYPES.ovirt:
      return {
        ...baseValues,
        [ProviderFormFieldId.OvirtPassword]: getDecodedValue(secret?.data?.password) ?? '',
        [ProviderFormFieldId.OvirtUsername]: getDecodedValue(secret?.data?.user) ?? '',
      };

    case PROVIDER_TYPES.openshift:
      return {
        ...baseValues,
        [ProviderFormFieldId.ServiceAccountToken]: getDecodedValue(secret?.data?.token) ?? '',
      };

    case PROVIDER_TYPES.openstack: {
      const authType = getDecodedValue(secret?.data?.authType);
      return {
        ...baseValues,
        [ProviderFormFieldId.OpenstackApplicationCredentialId]:
          getDecodedValue(secret?.data?.applicationCredentialID) ?? '',
        [ProviderFormFieldId.OpenstackApplicationCredentialName]:
          getDecodedValue(secret?.data?.applicationCredentialName) ?? '',
        [ProviderFormFieldId.OpenstackApplicationCredentialSecret]:
          getDecodedValue(secret?.data?.applicationCredentialSecret) ?? '',
        [ProviderFormFieldId.OpenstackAuthType]: authType as OpenstackAuthType,
        [ProviderFormFieldId.OpenstackDomainName]: getDecodedValue(secret?.data?.domainName) ?? '',
        [ProviderFormFieldId.OpenstackPassword]: getDecodedValue(secret?.data?.password) ?? '',
        [ProviderFormFieldId.OpenstackProjectId]: getDecodedValue(secret?.data?.projectID) ?? '',
        [ProviderFormFieldId.OpenstackProjectName]:
          getDecodedValue(secret?.data?.projectName) ?? '',
        [ProviderFormFieldId.OpenstackRegionName]: getDecodedValue(secret?.data?.regionName) ?? '',
        [ProviderFormFieldId.OpenstackToken]: getDecodedValue(secret?.data?.token) ?? '',
        [ProviderFormFieldId.OpenstackUserId]: getDecodedValue(secret?.data?.userID) ?? '',
        [ProviderFormFieldId.OpenstackUsername]: getDecodedValue(secret?.data?.username) ?? '',
      };
    }

    case PROVIDER_TYPES.ova:
    case undefined:
    default:
      return baseValues;
  }
};
