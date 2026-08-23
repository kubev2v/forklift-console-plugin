import type {
  K8sIoApiCoreV1NodeSelectorRequirement,
  K8sIoApiCoreV1NodeSelectorTerm,
  K8sIoApiCoreV1PodAffinityTerm,
  K8sIoApiCoreV1PreferredSchedulingTerm,
  K8sIoApiCoreV1WeightedPodAffinityTerm,
} from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import { K8sIoApiCoreV1NodeSelectorRequirementOperatorEnum } from './constants';
import type { AffinityLabel, AffinityRowData } from './types';

const MIN_WEIGHT = 1;
const MAX_WEIGHT = 100;

export const hasValidWeight = (row: AffinityRowData): row is AffinityRowData & { weight: number } =>
  typeof row.weight === 'number' &&
  Number.isInteger(row.weight) &&
  row.weight >= MIN_WEIGHT &&
  row.weight <= MAX_WEIGHT;

export const hasTopologyKey = (
  row: AffinityRowData,
): row is AffinityRowData & { topologyKey: string } =>
  typeof row.topologyKey === 'string' && !isEmpty(row.topologyKey.trim());

type WithWeight = AffinityRowData & { weight: number };
type WithTopologyKey = AffinityRowData & { topologyKey: string };
type WithWeightAndTopologyKey = WithWeight & WithTopologyKey;

export const hasWeightAndTopologyKey = (row: AffinityRowData): row is WithWeightAndTopologyKey =>
  hasValidWeight(row) && hasTopologyKey(row);

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

export const getRequiredNodeTermFromRowData = ({
  expressions,
  fields,
}: AffinityRowData): K8sIoApiCoreV1NodeSelectorTerm => ({
  matchExpressions: flattenExpressions(expressions),
  matchFields: flattenExpressions(fields),
});

export const getPreferredNodeTermFromRowData = ({
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

export const getRequiredPodTermFromRowData = ({
  expressions,
  topologyKey,
}: WithTopologyKey): K8sIoApiCoreV1PodAffinityTerm => ({
  labelSelector: {
    matchExpressions: flattenExpressions(expressions),
  },
  topologyKey,
});

export const getPreferredPodTermFromRowData = ({
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
