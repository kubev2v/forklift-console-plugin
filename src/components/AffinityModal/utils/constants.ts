import { Operator, type TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
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
  [AffinityType.node]: t('Node affinity'),
  [AffinityType.pod]: t('Workload (pod) affinity'),
  [AffinityType.podAnti]: t('Workload (pod) anti-affinity'),
};

export const AFFINITY_CONDITION_LABELS = {
  [AffinityCondition.preferred]: t('Preferred during scheduling'),
  [AffinityCondition.required]: t('Required during scheduling'),
};

export const affinityColumns = () => {
  const columns: TableColumn<AffinityRowData>[] = [
    {
      id: 'type',
      sort: 'type',
      title: t('Type'),
      transforms: [sortable],
    },
    {
      id: 'condition',
      sort: 'condition',
      title: t('Condition'),
      transforms: [sortable],
    },
    {
      id: 'weight',
      sort: 'weight',
      title: t('Weight'),
      transforms: [sortable],
    },
    {
      id: 'terms',
      title: t('Terms'),
    },
    {
      id: '',
      props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
      title: '',
    },
  ];
  return columns;
};

export const operatorSelectOptions = [
  { label: t('Exists'), value: Operator.Exists.valueOf() },
  { label: t('Does not exist'), value: Operator.DoesNotExist.valueOf() },
  { label: t('In'), value: Operator.In.valueOf() },
  { label: t('Not in'), value: Operator.NotIn.valueOf() },
];
