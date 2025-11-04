import type {
  K8sIoApiCoreV1PodAffinity,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PodAntiAffinity,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@kubev2v/types';
import type { V1beta1PlanSpecTargetAffinity } from '@kubev2v/types/dist/generated/forklift/models/V1beta1PlanSpecTargetAffinity';
import type { V1beta1PlanSpecTargetAffinityNodeAffinity } from '@kubev2v/types/dist/generated/forklift/models/V1beta1PlanSpecTargetAffinityNodeAffinity';
import type { V1beta1PlanSpecTargetAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecution } from '@kubev2v/types/src/generated/forklift/models/V1beta1PlanSpecTargetAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecution';
import type { V1beta1PlanSpecTargetAffinityNodeAffinityRequiredDuringSchedulingIgnoredDuringExecutionNodeSelectorTerms } from '@kubev2v/types/src/generated/forklift/models/V1beta1PlanSpecTargetAffinityNodeAffinityRequiredDuringSchedulingIgnoredDuringExecutionNodeSelectorTerms';

enum AffinityCondition {
  preferred = 'preferredDuringSchedulingIgnoredDuringExecution',
  required = 'requiredDuringSchedulingIgnoredDuringExecution',
}

const getNodeAffinity = (
  nodeAffinity: V1beta1PlanSpecTargetAffinityNodeAffinity | undefined,
): (
  | V1beta1PlanSpecTargetAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecution
  | V1beta1PlanSpecTargetAffinityNodeAffinityRequiredDuringSchedulingIgnoredDuringExecutionNodeSelectorTerms
)[] => {
  return [
    ...(nodeAffinity?.[AffinityCondition.preferred] ?? []),
    ...(nodeAffinity?.[AffinityCondition.required]?.nodeSelectorTerms ?? []),
  ];
};

const getPodAffinity = (
  podAffinity: K8sIoApiCoreV1PodAffinity | K8sIoApiCoreV1PodAntiAffinity | undefined,
): (K8sIoApiCoreV1PodAffinityTerm | K8sIoApiCoreV1WeightedPodAffinityTerm)[] => {
  return [
    ...(podAffinity?.[AffinityCondition.preferred] ?? []),
    ...(podAffinity?.[AffinityCondition.required] ?? []),
  ];
};

export const getAffinityRules = (
  affinity: V1beta1PlanSpecTargetAffinity | undefined,
): (
  | V1beta1PlanSpecTargetAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecution
  | K8sIoApiCoreV1PodAffinityTerm
  | V1beta1PlanSpecTargetAffinityNodeAffinityRequiredDuringSchedulingIgnoredDuringExecutionNodeSelectorTerms
  | K8sIoApiCoreV1WeightedPodAffinityTerm
)[] => {
  const nodeAffinity = getNodeAffinity(affinity?.nodeAffinity);
  const podAffinity = getPodAffinity(affinity?.podAffinity);
  const podAntiAffinity = getPodAffinity(affinity?.podAntiAffinity);
  return [...nodeAffinity, ...podAffinity, ...podAntiAffinity];
};
