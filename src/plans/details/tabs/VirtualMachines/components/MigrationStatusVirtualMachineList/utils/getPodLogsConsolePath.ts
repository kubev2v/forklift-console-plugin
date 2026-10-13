import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';

export const getPodLogsConsolePath = (pod: IoK8sApiCoreV1Pod, container?: string): string => {
  const base = `${getResourceUrl({
    name: getName(pod),
    namespace: getNamespace(pod),
    reference: 'pods',
  })}/logs`;

  if (!container) {
    return base;
  }

  return `${base}?container=${encodeURIComponent(container)}`;
};
