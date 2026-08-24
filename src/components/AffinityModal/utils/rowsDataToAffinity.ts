import type { K8sIoApiCoreV1Affinity } from '@forklift-ui/types';
import { isEmpty } from '@utils/helpers';

import {
  getPreferredNodeTermFromRowData,
  getPreferredPodTermFromRowData,
  getRequiredNodeTermFromRowData,
  getRequiredPodTermFromRowData,
  hasTopologyKey,
  hasValidWeight,
  hasWeightAndTopologyKey,
} from './affinityTermMappers';
import { AffinityCondition, type AffinityRowData, AffinityType } from './types';

type PickRowsMapper<T, R extends AffinityRowData = AffinityRowData> = (rowData: R) => T;

export const rowsDataToAffinity = (
  affinityRows: AffinityRowData[],
): K8sIoApiCoreV1Affinity | null => {
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
    AffinityType.Node,
    AffinityCondition.Required,
    getRequiredNodeTermFromRowData,
  );

  const nodeSelectorTermsPreferred = pickRows(
    AffinityType.Node,
    AffinityCondition.Preferred,
    getPreferredNodeTermFromRowData,
    hasValidWeight,
  );

  const podAffinityTermsRequired = pickRows(
    AffinityType.Pod,
    AffinityCondition.Required,
    getRequiredPodTermFromRowData,
    hasTopologyKey,
  );

  const podAffinityTermsPreferred = pickRows(
    AffinityType.Pod,
    AffinityCondition.Preferred,
    getPreferredPodTermFromRowData,
    hasWeightAndTopologyKey,
  );

  const antiPodAffinityTermsRequired = pickRows(
    AffinityType.PodAnti,
    AffinityCondition.Required,
    getRequiredPodTermFromRowData,
    hasTopologyKey,
  );

  const antiPodAffinityTermsPreferred = pickRows(
    AffinityType.PodAnti,
    AffinityCondition.Preferred,
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
