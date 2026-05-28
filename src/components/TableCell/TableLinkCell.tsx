import type { FC } from 'react';

import { type K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Tooltip } from '@patternfly/react-core';

import { TableLabelCell, type TableLabelCellProps } from './TableLabelCell';

export const TableLinkCell: FC<TableLinkCellProps> = ({
  groupVersionKind,
  hasLabel = false,
  label,
  labelColor = 'grey',
  name,
  namespace,
  truncate,
}) => {
  const link = (
    <ResourceLink
      groupVersionKind={groupVersionKind}
      name={name}
      namespace={namespace}
      truncate={truncate}
    />
  );

  return (
    <TableLabelCell
      className={truncate ? 'forklift-table-link-cell--truncate' : undefined}
      hasLabel={hasLabel}
      label={label}
      labelColor={labelColor}
    >
      {truncate && name ? (
        <Tooltip content={name}>
          <span>{link}</span>
        </Tooltip>
      ) : (
        link
      )}
    </TableLabelCell>
  );
};

type TableLinkCellProps = {
  groupVersionKind: K8sGroupVersionKind;
  name: string | undefined;
  namespace: string | undefined;
  truncate?: boolean;
} & TableLabelCellProps;
