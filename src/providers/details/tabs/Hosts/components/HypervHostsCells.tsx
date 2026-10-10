import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/components/TableCell/TableCell';

import ResizableTd from '@components/common/TableView/ResizableTd';

import type { HypervHost } from '../types';

const BYTES_PER_GIB = 1024 ** 3;

const formatBytes = (bytes: number): string => {
  if (!bytes) {
    return '0 GiB';
  }
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
              <ResizableTd
                columnId={fieldId}
                dataLabel={fieldId}
                key={fieldId}
                resourceFields={resourceFields}
              >
                <TableCell>{resourceData.name}</TableCell>
              </ResizableTd>
            );
          case 'state':
            return (
              <ResizableTd
                columnId={fieldId}
                dataLabel={fieldId}
                key={fieldId}
                resourceFields={resourceFields}
              >
                <TableCell>{resourceData.state}</TableCell>
              </ResizableTd>
            );
          case 'cpuSockets':
            return (
              <ResizableTd
                columnId={fieldId}
                dataLabel={fieldId}
                key={fieldId}
                resourceFields={resourceFields}
              >
                <TableCell>{resourceData.cpuSockets}</TableCell>
              </ResizableTd>
            );
          case 'cpuCores':
            return (
              <ResizableTd
                columnId={fieldId}
                dataLabel={fieldId}
                key={fieldId}
                resourceFields={resourceFields}
              >
                <TableCell>{resourceData.cpuCores}</TableCell>
              </ResizableTd>
            );
          case 'memoryBytes':
            return (
              <ResizableTd
                columnId={fieldId}
                dataLabel={fieldId}
                key={fieldId}
                resourceFields={resourceFields}
              >
                <TableCell>{formatBytes(resourceData.memoryBytes)}</TableCell>
              </ResizableTd>
            );
          default:
            return (
              <ResizableTd
                columnId={fieldId}
                dataLabel={fieldId}
                key={fieldId}
                resourceFields={resourceFields}
              >
                <TableCell />
              </ResizableTd>
            );
        }
      })}
    </>
  );
};

export default HypervHostsCells;
