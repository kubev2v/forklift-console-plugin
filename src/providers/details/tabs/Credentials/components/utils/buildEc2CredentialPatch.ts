import { decode, encode } from 'js-base64';
import { ProviderFormFieldId } from 'src/providers/create/fields/constants';
import type { CreateProviderFormData } from 'src/providers/create/types';

import { ADD } from '@components/ModalForm/utils/constants';

export type SecretDataPatchOperation = {
  op: typeof ADD;
  path: string;
  value: string;
};

const decodeValue = (value: string | undefined): string => (value ? decode(value) : '');

const hasInheritedTargetCredentials = (
  existingSecretData: Record<string, string> | undefined,
): boolean => {
  const sourceAccessKeyId = decodeValue(existingSecretData?.accessKeyId);
  const sourceSecretAccessKey = decodeValue(existingSecretData?.secretAccessKey);
  if (!sourceAccessKeyId || !sourceSecretAccessKey) {
    return false;
  }

  return (
    decodeValue(existingSecretData?.targetAccessKeyId) === sourceAccessKeyId &&
    decodeValue(existingSecretData?.targetSecretAccessKey) === sourceSecretAccessKey
  );
};

/**
 * Patches only the EC2 keys edited on the credentials tab instead of replacing the whole data map,
 * so target keys rotated concurrently are not restored. Target keys are patched as well only when
 * they were inherited from the source credentials (same value), keeping a source-key rotation in
 * sync; independently configured cross-account target keys are left untouched.
 */
export const buildEc2CredentialPatch = (
  formData: Partial<CreateProviderFormData>,
  existingSecretData?: Record<string, string>,
): SecretDataPatchOperation[] => {
  const accessKeyId = (formData[ProviderFormFieldId.Ec2AccessKeyId] ?? '').trim();
  const secretAccessKey = (formData[ProviderFormFieldId.Ec2SecretAccessKey] ?? '').trim();

  const operations: SecretDataPatchOperation[] = [
    { op: ADD, path: '/data/accessKeyId', value: encode(accessKeyId) },
    { op: ADD, path: '/data/secretAccessKey', value: encode(secretAccessKey) },
  ];

  if (hasInheritedTargetCredentials(existingSecretData)) {
    operations.push(
      { op: ADD, path: '/data/targetAccessKeyId', value: encode(accessKeyId) },
      { op: ADD, path: '/data/targetSecretAccessKey', value: encode(secretAccessKey) },
    );
  }

  return operations;
};
