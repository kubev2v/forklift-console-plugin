import type {
  V1beta1PlanSpecConvertorAffinity,
  V1beta1PlanSpecTargetAffinity,
  V1beta1PlanSpecTargetAffinityNodeAffinity,
  V1beta1PlanSpecTargetAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecution,
  V1beta1PlanSpecTargetAffinityNodeAffinityRequiredDuringSchedulingIgnoredDuringExecutionNodeSelectorTerms,
} from '@forklift-ui/types';
import type {
  K8sIoApiCoreV1PodAffinity,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PodAntiAffinity,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@forklift-ui/types';

type PlanAffinity = V1beta1PlanSpecConvertorAffinity | V1beta1PlanSpecTargetAffinity;

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
  affinity: PlanAffinity | undefined,
): (
  | V1beta1PlanSpecTargetAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecution
  | K8sIoApiCoreV1PodAffinityTerm
  | V1beta1PlanSpecTargetAffinityNodeAffinityRequiredDuringSchedulingIgnoredDuringExecutionNodeSelectorTerms
  | K8sIoApiCoreV1WeightedPodAffinityTerm
)[] => {
  const nodeAffinity = getNodeAffinity(
    affinity?.nodeAffinity as V1beta1PlanSpecTargetAffinityNodeAffinity | undefined,
  );
  const podAffinity = getPodAffinity(affinity?.podAffinity);
  const podAntiAffinity = getPodAffinity(affinity?.podAntiAffinity);
  return [...nodeAffinity, ...podAffinity, ...podAntiAffinity];
};
