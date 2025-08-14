import { type FC, Fragment, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/constants';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

const StorageMapReviewTable: FC = () => {
  const { control } = useCreatePlanFormContext();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const storageMap = useWatch({
    control,
    name: CreatePlanStorageMapFieldId.StorageMap,
  });

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
    <Table aria-label="Storage map review table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {hasOffloadStorage && <Th />}
          <Th width={50}>{storageMapFieldLabels[CreatePlanStorageMapFieldId.SourceStorage]}</Th>
          <Th width={50}>{storageMapFieldLabels[CreatePlanStorageMapFieldId.TargetStorage]}</Th>
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
                    <Td colSpan={3}>
                      <Stack hasGutter className="pf-v5-u-pt-md pf-v5-u-pb-md">
                        <StackItem>
                          <DescriptionList isHorizontal isCompact>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {storageMapFieldLabels[CreatePlanStorageMapFieldId.OffloadPlugin]}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {mapping[CreatePlanStorageMapFieldId.OffloadPlugin] ?? EMPTY_MSG}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {storageMapFieldLabels[CreatePlanStorageMapFieldId.StorageSecret]}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
                                {mapping[CreatePlanStorageMapFieldId.StorageSecret] ?? EMPTY_MSG}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                            <DescriptionListGroup>
                              <DescriptionListTerm>
                                {storageMapFieldLabels[CreatePlanStorageMapFieldId.StorageProduct]}
                              </DescriptionListTerm>
                              <DescriptionListDescription>
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
  );
};

export default StorageMapReviewTable;
