import type { V1beta1Provider } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';
import { PROVIDER_TYPES } from '@utils/providers/constants';

type PlatformFlags = {
  isAwsPlatform: boolean;
  isAzurePlatform: boolean;
};

export const isPlatformRestrictedProvider = (
  provider: V1beta1Provider,
  { isAwsPlatform, isAzurePlatform }: PlatformFlags,
): boolean => {
  const providerType = provider.spec?.type;

  return (
    (providerType === PROVIDER_TYPES.ec2 && !isAwsPlatform) ||
    (providerType === PROVIDER_TYPES.azure && !isAzurePlatform)
  );
};

const isProvider = (obj: unknown): obj is V1beta1Provider =>
  typeof obj === 'object' &&
  obj !== null &&
  'kind' in obj &&
  (obj as V1beta1Provider).kind === 'Provider';

export const extractProviders = (value: unknown): V1beta1Provider[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value) && (isEmpty(value) || isProvider(value[0]))) {
    return value as V1beta1Provider[];
  }

  if (Array.isArray(value)) {
    const innerArray = value.find(
      (entry): entry is V1beta1Provider[] =>
        Array.isArray(entry) && (isEmpty(entry) || isProvider(entry[0])),
    );

    if (innerArray) {
      return innerArray;
    }
  }

  return [];
};
