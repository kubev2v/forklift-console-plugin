import type {
  K8sIoApiCoreV1Affinity,
  K8sIoApiCoreV1NodeSelectorRequirement,
  K8sIoApiCoreV1NodeSelectorTerm,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PreferredSchedulingTerm,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum } from './constants';
import { AffinityCondition, type AffinityLabel, type AffinityRowData, AffinityType } from './types';

const MIN_WEIGHT = 1;
const MAX_WEIGHT = 100;

const hasValidWeight = (row: AffinityRowData): row is AffinityRowData & { weight: number } =>
  typeof row.weight === 'number' && row.weight >= MIN_WEIGHT && row.weight <= MAX_WEIGHT;

const hasTopologyKey = (row: AffinityRowData): row is AffinityRowData & { topologyKey: string } =>
  typeof row.topologyKey === 'string' && row.topologyKey.length > 0;

type WithWeight = AffinityRowData & { weight: number };
type WithTopologyKey = AffinityRowData & { topologyKey: string };
type WithWeightAndTopologyKey = WithWeight & WithTopologyKey;

const hasWeightAndTopologyKey = (row: AffinityRowData): row is WithWeightAndTopologyKey =>
  hasValidWeight(row) && hasTopologyKey(row);

type PickRowsMapper<T, R extends AffinityRowData = AffinityRowData> = (rowData: R) => T;

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
}: WithWeight): K8sIoApiCoreV1PreferredSchedulingTerm => ({
  preference: {
    matchExpressions: flattenExpressions(expressions),
    matchFields: flattenExpressions(fields),
  },
  weight,
});

const getRequiredPodTermFromRowData = ({
  expressions,
  topologyKey,
}: WithTopologyKey): K8sIoApiCoreV1PodAffinityTerm => ({
  labelSelector: {
    matchExpressions: flattenExpressions(expressions),
  },
  topologyKey,
});

const getPreferredPodTermFromRowData = ({
  expressions,
  topologyKey,
  weight,
}: WithWeightAndTopologyKey): K8sIoApiCoreV1WeightedPodAffinityTerm => ({
  podAffinityTerm: {
    labelSelector: {
      matchExpressions: flattenExpressions(expressions),
    },
    topologyKey,
  },
  weight,
});

export const rowsDataToAffinity = (affinityRows: AffinityRowData[]) => {
  if (isEmpty(affinityRows)) {
    return null;
  }

  function pickRows<T>(
    affinityType: AffinityType,
    condition: AffinityCondition,
    mapper: PickRowsMapper<T>,
  ): T[];
  function pickRows<T, R extends AffinityRowData>(
    affinityType: AffinityType,
    condition: AffinityCondition,
    mapper: PickRowsMapper<T, R>,
    isComplete: (row: AffinityRowData) => row is R,
  ): T[];
  function pickRows<T, R extends AffinityRowData>(
    affinityType: AffinityType,
    condition: AffinityCondition,
    mapper: PickRowsMapper<T, R>,
    isComplete?: (row: AffinityRowData) => row is R,
  ): T[] {
    const matched = affinityRows.filter(
      (row) => row.type === affinityType && row.condition === condition,
    );
    if (isComplete) {
      return matched.filter(isComplete).map(mapper);
    }
    return (matched as R[]).map(mapper);
  }

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
    hasValidWeight,
  );

  const podAffinityTermsRequired = pickRows(
    AffinityType.pod,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
    hasTopologyKey,
  );

  const podAffinityTermsPreferred = pickRows(
    AffinityType.pod,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
    hasWeightAndTopologyKey,
  );

  const antiPodAffinityTermsRequired = pickRows(
    AffinityType.podAnti,
    AffinityCondition.required,
    getRequiredPodTermFromRowData,
    hasTopologyKey,
  );

  const antiPodAffinityTermsPreferred = pickRows(
    AffinityType.podAnti,
    AffinityCondition.preferred,
    getPreferredPodTermFromRowData,
    hasWeightAndTopologyKey,
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
