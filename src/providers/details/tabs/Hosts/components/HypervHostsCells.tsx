import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/components/TableCell/TableCell';

import { Td } from '@patternfly/react-table';

import type { HypervHost } from '../types';

const BYTES_PER_GIB = 1024 ** 3;

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 GiB';
  const gb = bytes / BYTES_PER_GIB;
  return `${gb.toFixed(1)} GiB`;
};

const HypervHostsCells: FC<RowProps<HypervHost>> = ({ resourceData, resourceFields }) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) => {
        const fieldId = resourceFieldId ?? '';
        switch (fieldId) {
          case 'name':
            return (
              <Td key={fieldId} dataLabel={fieldId}>
                <TableCell>{resourceData.name}</TableCell>
              </Td>
            );
          case 'state':
            return (
              <Td key={fieldId} dataLabel={fieldId}>
                <TableCell>{resourceData.state}</TableCell>
              </Td>
            );
          case 'cpuSockets':
            return (
              <Td key={fieldId} dataLabel={fieldId}>
                <TableCell>{resourceData.cpuSockets}</TableCell>
              </Td>
            );
          case 'cpuCores':
            return (
              <Td key={fieldId} dataLabel={fieldId}>
                <TableCell>{resourceData.cpuCores}</TableCell>
              </Td>
            );
          case 'memoryBytes':
            return (
              <Td key={fieldId} dataLabel={fieldId}>
                <TableCell>{formatBytes(resourceData.memoryBytes)}</TableCell>
              </Td>
            );
          default:
            return (
              <Td key={fieldId} dataLabel={fieldId}>
                <TableCell />
              </Td>
            );
        }
      })}
    </>
  );
};

export default HypervHostsCells;
