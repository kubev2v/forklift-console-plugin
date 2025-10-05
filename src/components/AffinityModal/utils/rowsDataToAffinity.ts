import type {
  K8sIoApiCoreV1Affinity,
  K8sIoApiCoreV1NodeSelectorRequirement,
  K8sIoApiCoreV1NodeSelectorTerm,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PreferredSchedulingTerm,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@kubev2v/types';
import { isEmpty } from '@utils/helpers';

import { K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum } from './constants';
import { AffinityCondition, type AffinityLabel, type AffinityRowData, AffinityType } from './types';

type PickRowsMapper<T> = (rowData: AffinityRowData) => T;

const flattenExpressions = (
  affinityLabels: AffinityLabel[] | undefined,
): K8sIoApiCoreV1NodeSelectorRequirement[] => {
  if (!affinityLabels) {
    return [];
  }

  return affinityLabels?.map((aff) => {
    const { id: _id, ...affinityWithoutID } = aff;

    const affinityRequirement = { ...affinityWithoutID } as K8sIoApiCoreV1NodeSelectorRequirement;
    return aff.operator === K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum.Exists ||
      aff.operator === K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum.DoesNotExist
      ? { ...affinityRequirement, values: [] }
      : affinityRequirement;
  });
};

const getRequiredNodeTermFromRowData = ({
  expressions,
  fields,
}: AffinityRowData): K8sIoApiCoreV1NodeSelectorTerm => ({
  matchExpressions: flattenExpressions(expressions),
  matchFields: flattenExpressions(fields),
});

const getPreferredNodeTermFromRowData = ({
  expressions,
  fields,
  weight,
}: AffinityRowData): K8sIoApiCoreV1PreferredSchedulingTerm => ({
  preference: {
    matchExpressions: flattenExpressions(expressions),
    matchFields: flattenExpressions(fields),
  },
  weight: weight!,
});

const getRequiredPodTermFromRowData = ({
  expressions,
  topologyKey,
}: AffinityRowData): K8sIoApiCoreV1PodAffinityTerm => ({
  labelSelector: {
    matchExpressions: flattenExpressions(expressions),
  },
  topologyKey: topologyKey!,
});

const getPreferredPodTermFromRowData = ({
  expressions,
  topologyKey,
  weight,
}: AffinityRowData): K8sIoApiCoreV1WeightedPodAffinityTerm => ({
  podAffinityTerm: {
    labelSelector: {
      matchExpressions: flattenExpressions(expressions),
    },
    topologyKey: topologyKey!,
  },
  weight: weight!,
});

export const rowsDataToAffinity = (affinityRows: AffinityRowData[]) => {
  if (isEmpty(affinityRows)) {
    return null;
  }

  const pickRows = <T>(
    affinityType: AffinityType,
    condition: AffinityCondition,
    mapper: PickRowsMapper<T>,
  ): T[] =>
    affinityRows
      .filter((row) => row.type === affinityType && row.condition === condition)
      .map(mapper);

  const affinity = {} as K8sIoApiCoreV1Affinity;

  const nodeSelectorTermsRequired = pickRows(
    AffinityType.node,
    AffinityCondition.required,
    getRequiredNodeTermFromRowData,
  );

  const nodeSelectorTermsPreferred = pickRows(
    AffinityType.node,
    AffinityCondition.preferred,
    getPreferredNodeTermFromRowData,
  );

  const podAffinityTermsRequired = pickRows(
    AffinityType.pod,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
  );

  const podAffinityTermsPreferred = pickRows(
    AffinityType.pod,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
  );

  const antiPodAffinityTermsRequired = pickRows(
    AffinityType.podAnti,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
  );

  const antiPodAffinityTermsPreferred = pickRows(
    AffinityType.podAnti,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
  );

  if (!isEmpty(nodeSelectorTermsRequired)) {
    affinity.nodeAffinity = {
      requiredDuringSchedulingIgnoredDuringExecution: {
        nodeSelectorTerms: nodeSelectorTermsRequired,
      },
    };
  }

  if (!isEmpty(nodeSelectorTermsPreferred)) {
    affinity.nodeAffinity = {
      preferredDuringSchedulingIgnoredDuringExecution: nodeSelectorTermsPreferred,
    };
  }

  if (!isEmpty(podAffinityTermsRequired)) {
    affinity.podAffinity = {
      requiredDuringSchedulingIgnoredDuringExecution: podAffinityTermsRequired,
    };
  }

  if (!isEmpty(podAffinityTermsPreferred)) {
    affinity.podAffinity = {
      preferredDuringSchedulingIgnoredDuringExecution: podAffinityTermsPreferred,
    };
  }

  if (!isEmpty(antiPodAffinityTermsRequired)) {
    affinity.podAntiAffinity = {
      requiredDuringSchedulingIgnoredDuringExecution: antiPodAffinityTermsRequired,
    };
  }

  if (!isEmpty(antiPodAffinityTermsPreferred)) {
    affinity.podAntiAffinity = {
      preferredDuringSchedulingIgnoredDuringExecution: antiPodAffinityTermsPreferred,
    };
  }

  return affinity;
};
