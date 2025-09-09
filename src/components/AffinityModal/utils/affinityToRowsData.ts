import type {
  K8sIoApiCoreV1Affinity,
  K8sIoApiCoreV1NodeAffinity,
  K8sIoApiCoreV1PodAffinity,
  K8sIoApiCoreV1PodAntiAffinity,
  K8sIoApimachineryPkgApisMetaV1LabelSelectorRequirement,
} from '@kubev2v/types';

import { AffinityCondition, type AffinityRowData, AffinityType } from './types';

const setIDsToEntity = (
  entity: K8sIoApimachineryPkgApisMetaV1LabelSelectorRequirement[] | undefined,
) => entity?.map((elm, index) => ({ ...elm, id: index }));

const getNodeAffinityRows = (
  nodeAffinity: K8sIoApiCoreV1NodeAffinity | undefined,
): AffinityRowData[] => {
  const requiredTerms =
    nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms ?? [];
  const preferredTerms = nodeAffinity?.preferredDuringSchedulingIgnoredDuringExecution ?? [];

  const required = requiredTerms.map(({ matchExpressions, matchFields }, i) => ({
    condition: AffinityCondition.required,
    expressions: setIDsToEntity(matchExpressions),
    fields: setIDsToEntity(matchFields),
    id: `node-required-${i}`,
    type: AffinityType.node,
  }));

  const preferred = preferredTerms.map(({ preference, weight }, i) => ({
    condition: AffinityCondition.preferred,
    expressions: setIDsToEntity(preference.matchExpressions),
    fields: setIDsToEntity(preference.matchFields),
    id: `node-preferred-${i}`,
    type: AffinityType.node,
    weight,
  }));

  return [...required, ...preferred] as AffinityRowData[];
};

const getPodLikeAffinityRows = (
  podLikeAffinity: K8sIoApiCoreV1PodAffinity | K8sIoApiCoreV1PodAntiAffinity | undefined,
  isAnti = false,
): AffinityRowData[] => {
  const requiredTerms = podLikeAffinity?.requiredDuringSchedulingIgnoredDuringExecution ?? [];
  const preferredTerms = podLikeAffinity?.preferredDuringSchedulingIgnoredDuringExecution ?? [];

  const required = requiredTerms?.map((podAffinityTerm, i) => ({
    condition: AffinityCondition.required,
    expressions: setIDsToEntity(podAffinityTerm?.labelSelector?.matchExpressions),
    id: isAnti ? `pod-anti-required-${i}` : `pod-required-${i}`,
    namespaces: podAffinityTerm?.namespaces,
    topologyKey: podAffinityTerm?.topologyKey,
    type: isAnti ? AffinityType.podAnti : AffinityType.pod,
  }));

  const preferred = preferredTerms?.map(({ podAffinityTerm, weight }, i) => ({
    condition: AffinityCondition.preferred,
    expressions: setIDsToEntity(podAffinityTerm?.labelSelector?.matchExpressions),
    id: isAnti ? `pod-anti-preferred-${i}` : `pod-preferred-${i}`,
    namespaces: podAffinityTerm?.namespaces,
    topologyKey: podAffinityTerm?.topologyKey,
    type: isAnti ? AffinityType.podAnti : AffinityType.pod,
    weight,
  }));

  return [...required, ...preferred] as AffinityRowData[];
};

export const affinityToRowsData = (affinity: K8sIoApiCoreV1Affinity): AffinityRowData[] => [
  ...getNodeAffinityRows(affinity?.nodeAffinity),
  ...getPodLikeAffinityRows(affinity?.podAffinity),
  ...getPodLikeAffinityRows(affinity?.podAntiAffinity, true),
];
