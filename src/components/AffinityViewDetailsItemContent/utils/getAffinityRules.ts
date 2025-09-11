import type {
  K8sIoApiCoreV1Affinity,
  K8sIoApiCoreV1NodeAffinity,
  K8sIoApiCoreV1NodeSelectorTerm,
  K8sIoApiCoreV1PodAffinity,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PodAntiAffinity,
  K8sIoApiCoreV1PreferredSchedulingTerm,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@kubev2v/types';

enum AffinityCondition {
  preferred = 'preferredDuringSchedulingIgnoredDuringExecution',
  required = 'requiredDuringSchedulingIgnoredDuringExecution',
}

const getNodeAffinity = (
  nodeAffinity: K8sIoApiCoreV1NodeAffinity | undefined,
): (K8sIoApiCoreV1NodeSelectorTerm | K8sIoApiCoreV1PreferredSchedulingTerm)[] => {
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
  affinity: K8sIoApiCoreV1Affinity | undefined,
): (
  | K8sIoApiCoreV1NodeSelectorTerm
  | K8sIoApiCoreV1PodAffinityTerm
  | K8sIoApiCoreV1PreferredSchedulingTerm
  | K8sIoApiCoreV1WeightedPodAffinityTerm
)[] => {
  const nodeAffinity = getNodeAffinity(affinity?.nodeAffinity);
  const podAffinity = getPodAffinity(affinity?.podAffinity);
  const podAntiAffinity = getPodAffinity(affinity?.podAntiAffinity);
  return [...nodeAffinity, ...podAffinity, ...podAntiAffinity];
};
