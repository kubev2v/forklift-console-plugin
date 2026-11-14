import { decode, encode } from 'js-base64';
import { ProviderFormFieldId } from 'src/providers/create/fields/constants';
import type { CreateProviderFormData } from 'src/providers/create/types';

import { ADD, TEST } from '@components/ModalForm/utils/constants';

export type SecretDataPatchOperation = {
  op: typeof ADD | typeof TEST;
  path: string;
  value?: string | Record<string, string>;
};

const SECRET_DATA_PATH = '/data';
const RESOURCE_VERSION_PATH = '/metadata/resourceVersion';

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

const buildResourceVersionTest = (resourceVersion?: string): SecretDataPatchOperation[] =>
  resourceVersion ? [{ op: TEST, path: RESOURCE_VERSION_PATH, value: resourceVersion }] : [];

const buildDataOperations = (
  formData: Partial<CreateProviderFormData>,
  existingSecretData: Record<string, string> | undefined,
): SecretDataPatchOperation[] => {
  const accessKeyId = encode((formData[ProviderFormFieldId.Ec2AccessKeyId] ?? '').trim());
  const secretAccessKey = encode((formData[ProviderFormFieldId.Ec2SecretAccessKey] ?? '').trim());

  if (!existingSecretData) {
    return [{ op: ADD, path: SECRET_DATA_PATH, value: { accessKeyId, secretAccessKey } }];
  }

  const operations: SecretDataPatchOperation[] = [
    { op: ADD, path: `${SECRET_DATA_PATH}/accessKeyId`, value: accessKeyId },
    { op: ADD, path: `${SECRET_DATA_PATH}/secretAccessKey`, value: secretAccessKey },
  ];

  if (hasInheritedTargetCredentials(existingSecretData)) {
    operations.push(
      { op: ADD, path: `${SECRET_DATA_PATH}/targetAccessKeyId`, value: accessKeyId },
      { op: ADD, path: `${SECRET_DATA_PATH}/targetSecretAccessKey`, value: secretAccessKey },
    );
  }

  return operations;
};

/**
 * Patches only the EC2 keys edited on the credentials tab instead of replacing the whole data map,
 * so target keys rotated concurrently are not restored. Target keys are patched as well only when
 * they were inherited from the source credentials (same value), keeping a source-key rotation in
 * sync; independently configured cross-account target keys are left untouched. The patch is
 * guarded by a resourceVersion test so a rotation that landed while the dialog was open fails the
 * patch atomically instead of being overwritten.
 */
export const buildEc2CredentialPatch = (
  formData: Partial<CreateProviderFormData>,
  existingSecretData?: Record<string, string>,
  resourceVersion?: string,
): SecretDataPatchOperation[] => [
  ...buildResourceVersionTest(resourceVersion),
  ...buildDataOperations(formData, existingSecretData),
];
