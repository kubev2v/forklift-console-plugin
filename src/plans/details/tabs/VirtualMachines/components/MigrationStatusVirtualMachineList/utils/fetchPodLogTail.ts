import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';

const DEFAULT_TAIL_LINES = 200;

export const fetchPodLogTail = async (
  pod: IoK8sApiCoreV1Pod,
  container: string | undefined,
  tailLines = DEFAULT_TAIL_LINES,
): Promise<string> => {
  const namespace = getNamespace(pod);
  const name = getName(pod);
  const params = new URLSearchParams({ tailLines: String(tailLines) });
  if (container) {
    params.set('container', container);
  }

  const response = await consoleFetch(
    `/api/kubernetes/api/v1/namespaces/${namespace}/pods/${name}/log?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load pod logs (${String(response.status)})`);
  }

  return response.text();
};
