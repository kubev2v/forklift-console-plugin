import React from 'react';

import { K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { TableLabelCell, TableLabelCellProps } from './TableLabelCell';

/**
 * A component that displays a resource link, with an optional label.
 *
 * @param {TableLinkCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableLinkCell component.
 */
export const TableLinkCell: React.FC<TableLinkCellProps> = ({
  groupVersionKind,
  name,
  namespace,
  hasLabel = false,
  label,
  labelColor = 'grey',
}) => {
  return (
    <TableLabelCell hasLabel={hasLabel} label={label} labelColor={labelColor} isWrap={true}>
      <ResourceLink groupVersionKind={groupVersionKind} name={name} namespace={namespace} />
    </TableLabelCell>
  );
};

export interface TableLinkCellProps extends TableLabelCellProps {
  groupVersionKind: K8sGroupVersionKind;
  name: string;
  namespace: string;
}
