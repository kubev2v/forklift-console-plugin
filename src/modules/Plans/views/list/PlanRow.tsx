import React, { type FC } from 'react';
import { ConsoleTimestamp } from 'src/components';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils';

import type { ResourceField } from '@components/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import type { PlanData } from '../../utils';

import {
  ActionsCell,
  type CellProps,
  MigrationTypeCell,
  NamespaceCell,
  PlanCell,
  PlanStatusCell,
  ProviderLinkCell,
  VMsCell,
} from './components';
import { PlanTableResourceId } from './constants';

export const PlanRow: React.FC<RowProps<PlanData>> = ({ resourceData, resourceFields }) => {
  return (
    <Tr>
      {resourceFields.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </Tr>
  );
};

const renderTd = ({ resourceData, resourceFieldId, resourceFields }: RenderTdProps) => {
  const fieldId = resourceFieldId;

  const CellRenderer = cellRenderers?.[fieldId] ?? (() => <></>);
  return (
    <Td key={fieldId} dataLabel={fieldId}>
      <CellRenderer data={resourceData} fieldId={fieldId} fields={resourceFields} />
    </Td>
  );
};

const cellRenderers: Partial<Record<PlanTableResourceId, FC<CellProps>>> = {
  [PlanTableResourceId.Actions]: ActionsCell,
  [PlanTableResourceId.Description]: ({ data }: CellProps) => (
    <TableCell>{data?.obj?.spec?.description}</TableCell>
  ),
  [PlanTableResourceId.Destination]: ProviderLinkCell,
  [PlanTableResourceId.MigrationStarted]: (props: CellProps) => {
    const value = getResourceFieldValue(props.data, props.fieldId, props.fields);
    return <ConsoleTimestamp timestamp={value} />;
  },
  [PlanTableResourceId.MigrationType]: MigrationTypeCell,
  [PlanTableResourceId.Name]: PlanCell,
  [PlanTableResourceId.Namespace]: NamespaceCell,
  [PlanTableResourceId.Phase]: PlanStatusCell,
  [PlanTableResourceId.Source]: ProviderLinkCell,
  [PlanTableResourceId.Vms]: VMsCell,
};

type RenderTdProps = {
  resourceData: PlanData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

export default PlanRow;
