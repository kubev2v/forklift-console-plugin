import { encode } from 'js-base64';
import {
  CertificateValidationMode,
  ProviderFormFieldId,
} from 'src/providers/create/fields/constants';
import type { CreateProviderFormData } from 'src/providers/create/types';
import { getAuthTypeValue } from 'src/providers/create/utils/buildOpenstackProviderResources';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { getType } from '@utils/crds/common/selectors';

import { getOpenstackFieldsByAuthType } from './getOpenstackFieldsByAuthType';
// Mapping from secret data keys to form field IDs (not actual credentials, just field name mapping)
const secretKeyToFormFieldId: Record<string, keyof typeof ProviderFormFieldId> = {
  applicationCredentialID: 'OpenstackApplicationCredentialId',
  applicationCredentialName: 'OpenstackApplicationCredentialName',
  applicationCredentialSecret: 'OpenstackApplicationCredentialSecret',
  domainName: 'OpenstackDomainName',
  password: 'OpenstackPassword', // NOSONAR - This is a field name mapping, not a hardcoded credential
  projectID: 'OpenstackProjectId',
  projectName: 'OpenstackProjectName',
  regionName: 'OpenstackRegionName',
  token: 'OpenstackToken',
  userID: 'OpenstackUserId',
  username: 'OpenstackUsername',
};

/**
 * Build the secret data from form values
 */
export const buildSecretData = (
  formData: Partial<CreateProviderFormData>,
  provider: V1beta1Provider,
): Record<string, string> => {
  const providerType = getType(provider);
  const insecureSkipVerify =
    formData[ProviderFormFieldId.CertificateValidation] === CertificateValidationMode.Skip;

  const baseData: Record<string, string> = {
    insecureSkipVerify: encode(insecureSkipVerify.toString()),
  };

  if (!insecureSkipVerify && formData[ProviderFormFieldId.CaCertificate]) {
    baseData.cacert = encode(formData[ProviderFormFieldId.CaCertificate] ?? '');
  }

  switch (providerType) {
    case PROVIDER_TYPES.vsphere:
      return {
        ...baseData,
        password: encode(formData[ProviderFormFieldId.VspherePassword] ?? ''),
        user: encode(formData[ProviderFormFieldId.VsphereUsername] ?? ''),
      };

    case PROVIDER_TYPES.ovirt:
      return {
        ...baseData,
        password: encode(formData[ProviderFormFieldId.OvirtPassword] ?? ''),
        user: encode(formData[ProviderFormFieldId.OvirtUsername] ?? ''),
      };

    case PROVIDER_TYPES.openshift:
      return {
        ...baseData,
        token: encode(formData[ProviderFormFieldId.ServiceAccountToken] ?? ''),
      };

    case PROVIDER_TYPES.openstack: {
      const authType = formData[ProviderFormFieldId.OpenstackAuthType];
      const data: Record<string, string> = {
        ...baseData,
        authType: encode(getAuthTypeValue(authType)),
      };

      // Get only the fields that are allowed for this auth type
      const allowedFields = getOpenstackFieldsByAuthType(authType);

      // Add only the fields that are relevant for the selected auth type
      Object.keys(allowedFields).forEach((secretKey) => {
        const formFieldKey = secretKeyToFormFieldId[secretKey];
        if (formFieldKey) {
          const formFieldId = ProviderFormFieldId[formFieldKey];
          const value = formData[formFieldId as keyof typeof formData];
          if (value) {
            data[secretKey] = encode(value as string);
          }
        }
      });

      return data;
    }

    case PROVIDER_TYPES.ova:
    case undefined:
    default:
      return baseData;
  }
};
