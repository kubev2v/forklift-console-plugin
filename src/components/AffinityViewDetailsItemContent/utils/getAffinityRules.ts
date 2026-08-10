import type {
  K8sIoApiCoreV1Affinity,
  K8sIoApiCoreV1NodeAffinity,
  K8sIoApiCoreV1NodeSelectorTerm,
  K8sIoApiCoreV1PodAffinity,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PodAntiAffinity,
  K8sIoApiCoreV1PreferredSchedulingTerm,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@forklift-ui/types';

enum AffinityCondition {
  Preferred = 'preferredDuringSchedulingIgnoredDuringExecution',
  Required = 'requiredDuringSchedulingIgnoredDuringExecution',
}

const getNodeAffinity = (
  nodeAffinity: K8sIoApiCoreV1NodeAffinity | undefined,
): (K8sIoApiCoreV1PreferredSchedulingTerm | K8sIoApiCoreV1NodeSelectorTerm)[] => {
  return [
    ...(nodeAffinity?.[AffinityCondition.Preferred] ?? []),
    ...(nodeAffinity?.[AffinityCondition.Required]?.nodeSelectorTerms ?? []),
  ];
};

const getPodAffinity = (
  podAffinity: K8sIoApiCoreV1PodAffinity | K8sIoApiCoreV1PodAntiAffinity | undefined,
): (K8sIoApiCoreV1PodAffinityTerm | K8sIoApiCoreV1WeightedPodAffinityTerm)[] => {
  return [
    ...(podAffinity?.[AffinityCondition.Preferred] ?? []),
    ...(podAffinity?.[AffinityCondition.Required] ?? []),
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
