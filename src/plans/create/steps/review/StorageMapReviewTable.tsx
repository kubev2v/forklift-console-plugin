import { type FC, Fragment, useState } from 'react';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';

import { Card } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

import {
  REVIEW_TABLE_EXPANDABLE_HEADER_WIDTH,
  REVIEW_TABLE_HEADER_WIDTH,
  STORAGE_REVIEW_TABLE_HEADER_KEYS,
} from './utils/constants';
import OffloadDetailsRow from './OffloadDetailsRow';

type StorageMapReviewTableProps = {
  storageMap: StorageMapping[];
};

const StorageMapReviewTable: FC<StorageMapReviewTableProps> = ({ storageMap }) => {
  const { t } = useForkliftTranslation();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (!storageMap) return null;

  const hasValidMappings = storageMap.some(
    (mapping) =>
      mapping[CreatePlanStorageMapFieldId.SourceStorage].name &&
      mapping[CreatePlanStorageMapFieldId.TargetStorage].name,
  );

  if (!hasValidMappings) {
    return <>{t('No storage mappings defined.')}</>;
  }

  const hasOffloadStorage = storageMap.some(
    (mapping) => mapping[CreatePlanStorageMapFieldId.OffloadPlugin],
  );

  const handleToggleExpansion = (rowKey: string): void => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(rowKey)) {
      newExpandedRows.delete(rowKey);
    } else {
      newExpandedRows.add(rowKey);
    }

    setExpandedRows(newExpandedRows);
  };

  return (
    <Card>
      <Table
        aria-label="Storage map review table"
        variant={TableVariant.compact}
        borders
        data-testid="storage-map-review-table"
      >
        <Thead>
          <Tr>
            {hasOffloadStorage && <Th width={10} />}
            {STORAGE_REVIEW_TABLE_HEADER_KEYS.map((header) => (
              <Th
                key={header}
                width={
                  hasOffloadStorage
                    ? REVIEW_TABLE_EXPANDABLE_HEADER_WIDTH
                    : REVIEW_TABLE_HEADER_WIDTH
                }
              >
                {storageMapFieldLabels[header]}
              </Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {storageMap.map((mapping, index) => {
            if (
              !mapping[CreatePlanStorageMapFieldId.SourceStorage].name ||
              !mapping[CreatePlanStorageMapFieldId.TargetStorage].name
            ) {
              return null;
            }

            const accessModeDisplay = mapping[StorageMapFieldId.AccessMode] ?? t('Default');
            const rowKey = `${mapping[CreatePlanStorageMapFieldId.SourceStorage].name}-${index}`;
            const isExpanded = expandedRows.has(rowKey);
            const hasOffloadData = [
              mapping[CreatePlanStorageMapFieldId.OffloadPlugin],
              mapping[CreatePlanStorageMapFieldId.StorageSecret],
              mapping[CreatePlanStorageMapFieldId.StorageProduct],
            ].some(Boolean);

            return (
              <Fragment key={rowKey}>
                <Tr>
                  {hasOffloadStorage && (
                    <Td
                      {...(hasOffloadData && {
                        expand: {
                          isExpanded,
                          onToggle: () => {
                            handleToggleExpansion(rowKey);
                          },
                          rowIndex: index,
                        },
                      })}
                    />
                  )}
                  <Td dataLabel={CreatePlanStorageMapFieldId.SourceStorage}>
                    {mapping[CreatePlanStorageMapFieldId.SourceStorage].name}
                  </Td>
                  <Td dataLabel={CreatePlanStorageMapFieldId.TargetStorage}>
                    {mapping[CreatePlanStorageMapFieldId.TargetStorage].name}
                  </Td>
                  <Td dataLabel={StorageMapFieldId.AccessMode}>{accessModeDisplay}</Td>
                </Tr>
                {hasOffloadStorage && isExpanded && hasOffloadData && (
                  <OffloadDetailsRow index={index} mapping={mapping} />
                )}
              </Fragment>
            );
          })}
        </Tbody>
      </Table>
    </Card>
  );
};

export default StorageMapReviewTable;
