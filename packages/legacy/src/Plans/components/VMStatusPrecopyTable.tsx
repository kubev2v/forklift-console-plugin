import * as React from 'react';
import { Text, TextContent } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  textCenter,
  fitContent,
} from '@patternfly/react-table';

import { IVMStatus } from 'legacy/src/queries/types';
import { TickingElapsedTime } from 'legacy/src/common/components/TickingElapsedTime';
import { StatusIcon } from '@migtools/lib-ui';
import { CanceledIcon } from 'legacy/src/common/components/CanceledIcon';

interface IVMStatusPrecopyTableProps {
  status: IVMStatus;
  isCanceled: boolean;
}

export const VMStatusPrecopyTable: React.FunctionComponent<IVMStatusPrecopyTableProps> = ({
  status,
  isCanceled,
}: IVMStatusPrecopyTableProps) => {
  if (!status.warm || status.warm.precopies?.length === 0) {
    return (
      <TextContent>
        <Text component="p">Preparing to start incremental copies</Text>
      </TextContent>
    );
  }

  const sortedPrecopies = (status.warm.precopies || []).sort((a, b) => {
    // Most recent first
    if (a.start < b.start) return 1;
    if (a.start > b.start) return -1;
    return 0;
  });

  const columns: ICell[] = [
    {
      title: 'Copy number',
      columnTransforms: [textCenter, fitContent],
    },
    { title: 'Elapsed time' },
    { title: 'Status' },
  ];

  const rows: IRow[] = sortedPrecopies.map((precopy, index) => {
    const consecutiveFailures = (index === 0 && status.warm?.consecutiveFailures) || 0;
    return {
      meta: { precopy },
      cells: [
        sortedPrecopies.length - index,
        {
          title: <TickingElapsedTime start={precopy.start} end={precopy.end || status.completed} />,
        },
        {
          title: isCanceled ? (
            <CanceledIcon />
          ) : precopy.end ? (
            <StatusIcon status="Ok" label="Complete" />
          ) : status.error && index === 0 ? (
            <StatusIcon status="Error" label="Failed" />
          ) : (
            <StatusIcon
              status="Loading"
              label={`Copying data${
                consecutiveFailures > 0 ? ` - Retrying after ${consecutiveFailures} failures` : ''
              }`}
            />
          ),
        },
      ],
    };
  });

  return (
    <>
      <Table
        className="migration-inner-vmStatus-table"
        variant="compact"
        aria-label="VM status table for migration plan"
        cells={columns}
        rows={rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
    </>
  );
};
