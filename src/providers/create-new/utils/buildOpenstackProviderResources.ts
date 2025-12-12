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
  const username = formData[ProviderFormFieldId.OpenstackUsername]?.trim();
  const password = formData[ProviderFormFieldId.OpenstackPassword]?.trim();
  const token = formData[ProviderFormFieldId.OpenstackToken]?.trim();
  const userID = formData[ProviderFormFieldId.OpenstackUserId]?.trim();
  const projectID = formData[ProviderFormFieldId.OpenstackProjectId]?.trim();
  const regionName = formData[ProviderFormFieldId.OpenstackRegionName]?.trim();
  const projectName = formData[ProviderFormFieldId.OpenstackProjectName]?.trim();
  const domainName = formData[ProviderFormFieldId.OpenstackDomainName]?.trim();
  const appCredID = formData[ProviderFormFieldId.OpenstackApplicationCredentialId]?.trim();
  const appCredName = formData[ProviderFormFieldId.OpenstackApplicationCredentialName]?.trim();
  const appCredSecret = formData[ProviderFormFieldId.OpenstackApplicationCredentialSecret]?.trim();

  switch (type) {
    case OpenstackAuthType.Password:
      return {
        ...(username && { username: encodeFormValue(username) }),
        ...(password && { password: encodeFormValue(password) }),
        ...(regionName && { regionName: encodeFormValue(regionName) }),
        ...(projectName && { projectName: encodeFormValue(projectName) }),
        ...(domainName && { domainName: encodeFormValue(domainName) }),
      };

    case OpenstackAuthType.TokenWithUserId:
      return {
        ...(token && { token: encodeFormValue(token) }),
        ...(userID && { userID: encodeFormValue(userID) }),
        ...(projectID && { projectID: encodeFormValue(projectID) }),
        ...(regionName && { regionName: encodeFormValue(regionName) }),
      };

    case OpenstackAuthType.TokenWithUsername:
      return {
        ...(token && { token: encodeFormValue(token) }),
        ...(username && { username: encodeFormValue(username) }),
        ...(regionName && { regionName: encodeFormValue(regionName) }),
        ...(projectName && { projectName: encodeFormValue(projectName) }),
        ...(domainName && { domainName: encodeFormValue(domainName) }),
      };

    case OpenstackAuthType.ApplicationCredentialId:
      return {
        ...(appCredID && { applicationCredentialID: encodeFormValue(appCredID) }),
        ...(appCredSecret && { applicationCredentialSecret: encodeFormValue(appCredSecret) }),
        ...(regionName && { regionName: encodeFormValue(regionName) }),
        ...(projectName && { projectName: encodeFormValue(projectName) }),
      };

    case OpenstackAuthType.ApplicationCredentialName:
      return {
        ...(appCredName && { applicationCredentialName: encodeFormValue(appCredName) }),
        ...(appCredSecret && { applicationCredentialSecret: encodeFormValue(appCredSecret) }),
        ...(username && { username: encodeFormValue(username) }),
        ...(regionName && { regionName: encodeFormValue(regionName) }),
        ...(projectName && { projectName: encodeFormValue(projectName) }),
        ...(domainName && { domainName: encodeFormValue(domainName) }),
      };

    default:
      throw new Error(`Unsupported OpenStack authentication type: ${authType}`);
  }
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
