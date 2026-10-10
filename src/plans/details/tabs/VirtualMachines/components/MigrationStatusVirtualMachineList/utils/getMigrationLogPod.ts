import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';
import { PHASES } from '@utils/constants';
import { getLabels, getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

const IMAGE_CONVERSION_STEP = 'ImageConversion';
const VIRT_V2V_APP_LABEL = 'virt-v2v';
const WAIT_REBOOT_NAME_PREFIX = 'forklift-wait-reboot';

const isFailedPod = (pod: IoK8sApiCoreV1Pod): boolean => pod.status?.phase === PHASES.FAILED;

const isVirtV2vPod = (pod: IoK8sApiCoreV1Pod): boolean =>
  getLabels(pod)?.['forklift.app'] === VIRT_V2V_APP_LABEL;

const isWaitRebootPod = (pod: IoK8sApiCoreV1Pod): boolean =>
  getName(pod)?.startsWith(WAIT_REBOOT_NAME_PREFIX) ?? false;

export const getVirtV2vContainerName = (pod: IoK8sApiCoreV1Pod): string | undefined => {
  const match = pod.spec?.containers?.find((container) => container.name === VIRT_V2V_APP_LABEL);
  return match?.name ?? pod.spec?.containers?.[0]?.name;
};

export const getMigrationLogPod = (
  pipelineStepName: string | undefined,
  pods: IoK8sApiCoreV1Pod[] | undefined,
): IoK8sApiCoreV1Pod | undefined => {
  const podList = pods ?? [];
  if (isEmpty(podList)) {
    return undefined;
  }

  const candidates = podList.filter((pod) => !isWaitRebootPod(pod));

  if (pipelineStepName === IMAGE_CONVERSION_STEP) {
    const virtV2vPods = candidates.filter(isVirtV2vPod);
    const failedVirtV2v = virtV2vPods.find(isFailedPod);
    if (failedVirtV2v) {
      return failedVirtV2v;
    }
    if (!isEmpty(virtV2vPods)) {
      return virtV2vPods[0];
    }
  }

  const failedPod = candidates.find(isFailedPod);
  return failedPod ?? candidates[0];
};
