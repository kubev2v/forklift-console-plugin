import { type FC, Fragment, useState } from 'react';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';
import type { StorageMapping } from 'src/storageMaps/utils/types';

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

import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

import {
  REVIEW_TABLE_EXPANDABLE_HEADER_WIDTH,
  REVIEW_TABLE_HEADER_WIDTH,
  STORAGE_REVIEW_TABLE_HEADER_KEYS,
} from './utils/constants';

type StorageMapReviewTableProps = {
  storageMap: StorageMapping[];
};

const StorageMapReviewTable: FC<StorageMapReviewTableProps> = ({ storageMap }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (!storageMap) {
    return null;
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
            // Only render rows that have both source and target storage names
            if (
              mapping[CreatePlanStorageMapFieldId.SourceStorage].name &&
              mapping[CreatePlanStorageMapFieldId.TargetStorage].name
            ) {
              const rowKey = `${mapping[CreatePlanStorageMapFieldId.SourceStorage].name}-${index}`;
              const isExpanded = expandedRows.has(rowKey);
              const hasOffloadData =
                mapping[CreatePlanStorageMapFieldId.OffloadPlugin] ??
                mapping[CreatePlanStorageMapFieldId.StorageSecret] ??
                mapping[CreatePlanStorageMapFieldId.StorageProduct];

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
                  </Tr>
                  {hasOffloadStorage && isExpanded && hasOffloadData && (
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
                                <DescriptionListDescription
                                  data-testid={`review-offload-plugin-${index}`}
                                >
                                  {mapping[CreatePlanStorageMapFieldId.OffloadPlugin] ?? EMPTY_MSG}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                              <DescriptionListGroup>
                                <DescriptionListTerm>
                                  {storageMapFieldLabels[CreatePlanStorageMapFieldId.StorageSecret]}
                                </DescriptionListTerm>
                                <DescriptionListDescription
                                  data-testid={`review-storage-secret-${index}`}
                                >
                                  {mapping[CreatePlanStorageMapFieldId.StorageSecret] ?? EMPTY_MSG}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                              <DescriptionListGroup>
                                <DescriptionListTerm>
                                  {
                                    storageMapFieldLabels[
                                      CreatePlanStorageMapFieldId.StorageProduct
                                    ]
                                  }
                                </DescriptionListTerm>
                                <DescriptionListDescription
                                  data-testid={`review-storage-product-${index}`}
                                >
                                  {mapping[CreatePlanStorageMapFieldId.StorageProduct] ?? EMPTY_MSG}
                                </DescriptionListDescription>
                              </DescriptionListGroup>
                            </DescriptionList>
                          </StackItem>
                        </Stack>
                      </Td>
                    </Tr>
                  )}
                </Fragment>
              );
            }

            return null;
          })}
        </Tbody>
      </Table>
    </Card>
  );
};

export default StorageMapReviewTable;
