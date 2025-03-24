import React, { FC } from 'react';
import { ConsoleTimestamp } from 'src/components';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils';

import { ResourceField } from '@components/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import { PlanData } from '../../utils';

import {
  ActionsCell,
  CellProps,
  MigrationTypeCell,
  NamespaceCell,
  PlanCell,
  PlanStatusCell,
  ProviderLinkCell,
  VMsCell,
} from './components';
import { PlanTableResourceId } from './constants';

export const PlanRow: React.FC<RowProps<PlanData>> = ({ resourceFields, resourceData }) => {
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
  [PlanTableResourceId.Name]: PlanCell,
  [PlanTableResourceId.Namespace]: NamespaceCell,
  [PlanTableResourceId.MigrationStarted]: (props: CellProps) => {
    const value = getResourceFieldValue(props.data, props.fieldId, props.fields);
    return <ConsoleTimestamp timestamp={value} />;
  },
  [PlanTableResourceId.Destination]: ProviderLinkCell,
  [PlanTableResourceId.Source]: ProviderLinkCell,
  [PlanTableResourceId.Phase]: PlanStatusCell,
  [PlanTableResourceId.MigrationType]: MigrationTypeCell,
  [PlanTableResourceId.Vms]: VMsCell,
  [PlanTableResourceId.Description]: ({ data }: CellProps) => (
    <TableCell>{data?.obj?.spec?.description}</TableCell>
  ),
  [PlanTableResourceId.Actions]: ActionsCell,
};

interface RenderTdProps {
  resourceData: PlanData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

export default PlanRow;
