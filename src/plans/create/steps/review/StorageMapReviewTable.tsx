import { type FC, Fragment, useState } from 'react';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';
import { getPluginLabel, getVendorProductLabel } from 'src/storageMaps/utils/labelHelpers';

import {
  Card,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId, type StorageMapping } from '@utils/storage/types';

import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

import {
  REVIEW_TABLE_EXPANDABLE_HEADER_WIDTH,
  REVIEW_TABLE_HEADER_WIDTH,
  STORAGE_REVIEW_TABLE_HEADER_KEYS,
} from './utils/constants';

const OffloadDetailsRow: FC<{ index: number; mapping: StorageMapping }> = ({ index, mapping }) => (
  <Tr isExpanded>
    <Td />
    <Td colSpan={3} data-testid={`review-offload-details-${index}`}>
      <Stack hasGutter className="pf-v6-u-pt-md pf-v6-u-pb-md">
        <StackItem>
          <DescriptionList isHorizontal isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {storageMapFieldLabels[CreatePlanStorageMapFieldId.OffloadPlugin]}
              </DescriptionListTerm>
              <DescriptionListDescription data-testid={`review-offload-plugin-${index}`}>
                {mapping[CreatePlanStorageMapFieldId.OffloadPlugin]
                  ? getPluginLabel(mapping[CreatePlanStorageMapFieldId.OffloadPlugin] ?? '')
                  : EMPTY_MSG}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {storageMapFieldLabels[CreatePlanStorageMapFieldId.StorageSecret]}
              </DescriptionListTerm>
              <DescriptionListDescription data-testid={`review-storage-secret-${index}`}>
                {mapping[CreatePlanStorageMapFieldId.StorageSecret] ?? EMPTY_MSG}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {storageMapFieldLabels[CreatePlanStorageMapFieldId.StorageProduct]}
              </DescriptionListTerm>
              <DescriptionListDescription data-testid={`review-storage-product-${index}`}>
                {mapping[CreatePlanStorageMapFieldId.StorageProduct]
                  ? getVendorProductLabel(mapping[CreatePlanStorageMapFieldId.StorageProduct] ?? '')
                  : EMPTY_MSG}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </StackItem>
      </Stack>
    </Td>
  </Tr>
);

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

  const handleToggleExpansion = (rowKey: string) => {
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
                  <Td dataLabel={StorageMapFieldId.AccessMode}>
                    {mapping[StorageMapFieldId.AccessMode] ?? 'ReadWriteOnce'}
                  </Td>
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
