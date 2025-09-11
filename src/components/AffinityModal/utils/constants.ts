import { t } from '@utils/i18n';

import { AffinityCondition, type AffinityRowData, AffinityType } from './types';

export const AFFINITY_MODAL_DESCRIPTION = t(
  'Affinity rules allows you to specify hard-and soft-affinity for virtual machines. It is possible to write matching rules against workloads (virtual machines and Pods) and Nodes.',
);

export const WEIGHT_FIELD_HELP_TEXT = t('Weight must be a number between 1-100');

export const TOPOLOGY_KEY_FIELD_HELP_TEXT = t('Topology key must not be empty');

const TOPOLOGY_KEY_DEFAULT = t('kubernetes.io/hostname');

export const defaultNewAffinity = {
  condition: AffinityCondition.required,
  expressions: [],
  fields: [],
  topologyKey: TOPOLOGY_KEY_DEFAULT,
  type: AffinityType.node,
} as unknown as AffinityRowData;

export const AFFINITY_TYPE_LABELS = {
  [AffinityType.node]: 'Node Affinity',
  [AffinityType.pod]: 'Workload (pod) Affinity',
  [AffinityType.podAnti]: 'Workload (pod) Anti-Affinity',
};

export const AFFINITY_CONDITION_LABELS = {
  [AffinityCondition.preferred]: 'Preferred during scheduling',
  [AffinityCondition.required]: 'Required during scheduling',
};
