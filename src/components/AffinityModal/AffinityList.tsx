import { type FC, useMemo, useState } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import {
  SortByDirection,
  Table,
  Tbody,
  Th,
  Thead,
  type ThProps,
  Tr,
} from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import type { AffinityRowData } from './utils/types';
import AddAffinityRuleButton from './AddAffinityRuleButton';
import AffinityDescriptionText from './AffinityDescriptionText';
import AffinityRow from './AffinityRow';

type AffinityListProps = {
  affinities: AffinityRowData[];
  onAffinityClickAdd: () => void;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AFFINITY_SORT_COLUMN = {
  Condition: 1,
  Type: 0,
  Weight: 2,
} as const;

const getSortValue = (affinity: AffinityRowData, columnIndex: number): string | number => {
  if (columnIndex === AFFINITY_SORT_COLUMN.Type) {
    return affinity.type;
  }

  if (columnIndex === AFFINITY_SORT_COLUMN.Condition) {
    return affinity.condition;
  }

  if (columnIndex === AFFINITY_SORT_COLUMN.Weight) {
    return affinity.weight ?? 0;
  }

  return '';
};

const AffinityList: FC<AffinityListProps> = ({
  affinities,
  onAffinityClickAdd,
  onDelete,
  onEdit,
}) => {
  const { t } = useForkliftTranslation();
  const [activeSortIndex, setActiveSortIndex] = useState<number | undefined>();
  const [activeSortDirection, setActiveSortDirection] = useState<SortByDirection | undefined>();

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    columnIndex,
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    sortBy: {
      direction: activeSortDirection,
      index: activeSortIndex,
    },
  });

  const sortedAffinities = useMemo(() => {
    const rows = [...(affinities ?? [])];

    if (activeSortIndex === undefined || activeSortDirection === undefined) {
      return rows;
    }

    return rows.sort((a, b) => {
      const aValue = getSortValue(a, activeSortIndex);
      const bValue = getSortValue(b, activeSortIndex);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return activeSortDirection === SortByDirection.asc ? aValue - bValue : bValue - aValue;
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return activeSortDirection === SortByDirection.asc ? comparison : -comparison;
    });
  }, [activeSortDirection, activeSortIndex, affinities]);

  return (
    <Stack hasGutter>
      <StackItem>
        <AffinityDescriptionText />
      </StackItem>
      <StackItem data-testid="affinity-rules-list">
        <Table aria-label={t('Affinity rules')} variant="compact">
          <Thead>
            <Tr>
              <Th sort={getSortParams(AFFINITY_SORT_COLUMN.Type)}>{t('Type')}</Th>
              <Th sort={getSortParams(AFFINITY_SORT_COLUMN.Condition)}>{t('Condition')}</Th>
              <Th sort={getSortParams(AFFINITY_SORT_COLUMN.Weight)}>{t('Weight')}</Th>
              <Th>{t('Terms')}</Th>
              <Th className="pf-v6-c-table__action" />
            </Tr>
          </Thead>
          <Tbody>
            {sortedAffinities.map((affinity) => (
              <AffinityRow
                affinity={affinity}
                key={affinity.id}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </Tbody>
        </Table>
      </StackItem>
      <StackItem>
        <AddAffinityRuleButton isLinkButton onAffinityClickAdd={onAffinityClickAdd} />
      </StackItem>
    </Stack>
  );
};

export default AffinityList;
