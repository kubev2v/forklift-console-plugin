import { DISK_TRANSFER_METHOD_ANNOTATION } from 'src/providers/utils/constants';

import { type IoK8sApiCoreV1Secret, ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';

const normalizedSettings = (provider: V1beta1Provider): string =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(provider.spec?.settings ?? {})
        .filter(([, value]) => value !== '')
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );

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
      getName(existing) === name &&
      getNamespace(existing) === namespace &&
      existing.spec?.secret?.name === secretName &&
      existing.spec?.secret?.namespace === getNamespace(secret) &&
      existing.spec?.type === requested.spec?.type &&
      existing.spec?.url === requested.spec?.url &&
      normalizedSettings(existing) === normalizedSettings(requested) &&
      existing.metadata?.annotations?.[DISK_TRANSFER_METHOD_ANNOTATION] ===
        requested.metadata?.annotations?.[DISK_TRANSFER_METHOD_ANNOTATION]
    ) {
      return existing;
    }
  } catch {
    return undefined;
  }
  return undefined;
};
