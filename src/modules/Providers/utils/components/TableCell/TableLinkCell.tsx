import type { FC } from 'react';

import { type K8sGroupVersionKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { TableLabelCell, type TableLabelCellProps } from './TableLabelCell';

/**
 * A component that displays a resource link, with an optional label.
 *
 * @param {TableLinkCellProps} props - The props for the component.
 * @returns {ReactElement} The rendered TableLinkCell component.
 */
export const TableLinkCell: FC<TableLinkCellProps> = ({
  groupVersionKind,
  hasLabel = false,
  label,
  labelColor = 'grey',
  name,
  namespace,
}) => {
  return (
    <TableLabelCell hasLabel={hasLabel} label={label} labelColor={labelColor} isWrap={true}>
      <ResourceLink groupVersionKind={groupVersionKind} name={name} namespace={namespace} />
    </TableLabelCell>
  );
};

type TableLinkCellProps = {
  groupVersionKind: K8sGroupVersionKind;
  name: string;
  namespace: string;
} & TableLabelCellProps;
