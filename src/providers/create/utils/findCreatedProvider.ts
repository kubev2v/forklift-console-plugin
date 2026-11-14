import { DISK_TRANSFER_METHOD_ANNOTATION } from 'src/providers/utils/constants';

import { type IoK8sApiCoreV1Secret, ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import {
  getAnnotations,
  getName,
  getNamespace,
  getProviderSecretRef,
  getType,
  getUrl,
} from '@utils/crds/common/selectors';
import { hasObjectChangedInGivenFields } from '@utils/helpers/hasObjectChangedInGivenFields';

const normalizedSettings = (provider: V1beta1Provider): Record<string, string> =>
  Object.fromEntries(
    Object.entries(provider.spec?.settings ?? {}).filter(([, value]) => value !== ''),
  );

const getComparableProvider = (provider: V1beta1Provider): object => ({
  annotation: getAnnotations(provider)?.[DISK_TRANSFER_METHOD_ANNOTATION],
  name: getName(provider),
  namespace: getNamespace(provider),
  settings: normalizedSettings(provider),
  type: getType(provider),
  url: getUrl(provider),
});

export const findCreatedProvider = async (
  requested: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): Promise<V1beta1Provider | undefined> => {
  const name = getName(requested);
  const namespace = getNamespace(requested);
  const secretName = getName(secret);
  if (!name || !namespace || !secretName) {
    return undefined;
  }

  try {
    const existing = await k8sGet<V1beta1Provider>({ model: ProviderModel, name, ns: namespace });
    if (
      !hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: { ...getComparableProvider(existing), secret: getProviderSecretRef(existing) },
        oldObject: {
          ...getComparableProvider(requested),
          secret: { name: secretName, namespace: getNamespace(secret) },
        },
      })
    ) {
      return existing;
    }
  } catch {
    return undefined;
  }
  return undefined;
};
