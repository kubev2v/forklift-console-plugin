import { enumToTuple } from '@components/common/FilterGroup/helpers';
import {
  COMPACT_COLUMN_WIDTH,
  MEDIUM_COLUMN_WIDTH,
  REGULAR_COLUMN_WIDTH,
  WIDE_COLUMN_WIDTH,
} from '@components/common/TableView/columnWidthConstants';
import type { ResourceField } from '@components/common/utils/types';
import { MAP_STATUS } from '@utils/constants';
import { t as translate } from '@utils/i18n';

import { getMapPhase } from './shared';

export const getMapTableFields = (t: typeof translate = translate): ResourceField[] => [
  {
    defaultWidth: WIDE_COLUMN_WIDTH,
    filter: { placeholderLabel: t('Filter by name'), type: 'freetext' },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.obj.metadata.name',
    label: t('Name'),
    resourceFieldId: 'name',
    sortable: true,
  },
  {
    defaultWidth: MEDIUM_COLUMN_WIDTH,
    filter: { placeholderLabel: t('Filter by namespace'), type: 'freetext' },
    isIdentity: true,
    isVisible: true,
    jsonPath: '$.obj.metadata.namespace',
    label: t('Namespace'),
    resourceFieldId: 'namespace',
    sortable: true,
  },
  {
    defaultWidth: COMPACT_COLUMN_WIDTH,
    filter: {
      placeholderLabel: t('Status'),
      primary: true,
      type: 'enum',
      values: enumToTuple(MAP_STATUS),
    },
    isVisible: true,
    jsonPath: getMapPhase,
    label: t('Status'),
    resourceFieldId: 'phase',
    sortable: true,
  },
  {
    defaultWidth: REGULAR_COLUMN_WIDTH,
    filter: { placeholderLabel: t('Filter by source'), type: 'freetext' },
    isVisible: true,
    jsonPath: '$.obj.spec.provider.source.name',
    label: t('Source provider'),
    resourceFieldId: 'source',
    sortable: true,
  },
  {
    defaultWidth: REGULAR_COLUMN_WIDTH,
    filter: { placeholderLabel: t('Filter by target'), type: 'freetext' },
    isVisible: true,
    jsonPath: '$.obj.spec.provider.destination.name',
    label: t('Target provider'),
    resourceFieldId: 'destination',
    sortable: true,
  },
  {
    defaultWidth: REGULAR_COLUMN_WIDTH,
    filter: { placeholderLabel: t('Filter by namespace'), type: 'freetext' },
    isVisible: true,
    jsonPath: '$.obj.metadata.ownerReferences[0].name',
    label: t('Owner'),
    resourceFieldId: 'owner',
    sortable: true,
  },
  {
    isAction: true,
    isVisible: true,
    label: '',
    resourceFieldId: 'actions',
    sortable: false,
  },
];
