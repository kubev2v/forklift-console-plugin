import type { CreateProviderFormData } from 'src/providers/create/types';

import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { buildEc2CredentialPatch } from './buildEc2CredentialPatch';

export const patchEc2Credentials = async (
  secret: IoK8sApiCoreV1Secret,
  formData: Partial<CreateProviderFormData>,
): Promise<void> => {
  await k8sPatch({
    data: buildEc2CredentialPatch(formData, secret.data),
    model: SecretModel,
    resource: secret,
  });
};
