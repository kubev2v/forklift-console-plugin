import { encode } from 'js-base64';
import { OpenstackAuthType, PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { encodeFormValue } from '@utils/helpers/encodeFormValue';

import { CertificateValidationMode, ProviderFormFieldId } from '../fields/constants';
import type { OpenstackFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

type OpenstackFieldId = keyof OpenstackFormData;
type FieldMapping = Record<string, OpenstackFieldId>;

const AUTH_TYPE_FIELDS: Record<OpenstackAuthType, FieldMapping> = {
  [OpenstackAuthType.ApplicationCredentialId]: {
    applicationCredentialID: ProviderFormFieldId.OpenstackApplicationCredentialId,
    applicationCredentialSecret: ProviderFormFieldId.OpenstackApplicationCredentialSecret,
    projectName: ProviderFormFieldId.OpenstackProjectName,
    regionName: ProviderFormFieldId.OpenstackRegionName,
  },
  [OpenstackAuthType.ApplicationCredentialName]: {
    applicationCredentialName: ProviderFormFieldId.OpenstackApplicationCredentialName,
    applicationCredentialSecret: ProviderFormFieldId.OpenstackApplicationCredentialSecret,
    domainName: ProviderFormFieldId.OpenstackDomainName,
    projectName: ProviderFormFieldId.OpenstackProjectName,
    regionName: ProviderFormFieldId.OpenstackRegionName,
    username: ProviderFormFieldId.OpenstackUsername,
  },
  [OpenstackAuthType.Password]: {
    domainName: ProviderFormFieldId.OpenstackDomainName,
    password: ProviderFormFieldId.OpenstackPassword,
    projectName: ProviderFormFieldId.OpenstackProjectName,
    regionName: ProviderFormFieldId.OpenstackRegionName,
    username: ProviderFormFieldId.OpenstackUsername,
  },
  [OpenstackAuthType.TokenWithUserId]: {
    projectID: ProviderFormFieldId.OpenstackProjectId,
    regionName: ProviderFormFieldId.OpenstackRegionName,
    token: ProviderFormFieldId.OpenstackToken,
    userID: ProviderFormFieldId.OpenstackUserId,
  },
  [OpenstackAuthType.TokenWithUsername]: {
    domainName: ProviderFormFieldId.OpenstackDomainName,
    projectName: ProviderFormFieldId.OpenstackProjectName,
    regionName: ProviderFormFieldId.OpenstackRegionName,
    token: ProviderFormFieldId.OpenstackToken,
    username: ProviderFormFieldId.OpenstackUsername,
  },
};

const getAuthTypeValue = (authType: OpenstackAuthType | undefined): string => {
  const type = authType ?? OpenstackAuthType.Password;
  if (type === OpenstackAuthType.Password) return 'password';
  if (type === OpenstackAuthType.TokenWithUserId || type === OpenstackAuthType.TokenWithUsername) {
    return 'token';
  }
  return 'applicationcredential';
};

const getAuthFields = (
  formData: OpenstackFormData,
  authType: OpenstackAuthType | undefined,
): Record<string, string> => {
  const type = authType ?? OpenstackAuthType.Password;
  const fieldMapping = AUTH_TYPE_FIELDS[type];

  if (!fieldMapping) {
    throw new Error(`Unsupported OpenStack authentication type: ${authType}`);
  }

  return Object.entries(fieldMapping).reduce<Record<string, string>>(
    (acc, [outputKey, formFieldId]) => {
      const value = formData[formFieldId];
      return typeof value === 'string' && value
        ? { ...acc, [outputKey]: encodeFormValue(value) }
        : acc;
    },
    {},
  );
};

export const buildOpenstackProviderResources = (formData: OpenstackFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const openstackUrl = formData[ProviderFormFieldId.OpenstackUrl];
  const authType = formData[ProviderFormFieldId.OpenstackAuthType];
  const certificateValidation = formData[ProviderFormFieldId.CertificateValidation];
  const caCertificate = formData[ProviderFormFieldId.CaCertificate] ?? '';

  const skipCertValidation = certificateValidation === CertificateValidationMode.Skip;
  const url = openstackUrl?.trim() ?? '';

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.openstack,
    url,
  });

  const secretData: Record<string, string> = {
    authType: encode(getAuthTypeValue(authType)),
    insecureSkipVerify: encode(skipCertValidation ? 'true' : 'false'),
    url: encode(url),
    ...getAuthFields(formData, authType),
  };

  if (!skipCertValidation && caCertificate?.trim()) {
    secretData.cacert = encode(caCertificate.trim());
  }

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};
