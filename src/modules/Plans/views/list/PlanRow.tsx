import React, { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import { ResourceField } from '@components/common/utils/types';
import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { Td, Tr } from '@patternfly/react-table';

import { ActionsCell } from './components/ActionsCell';
import { CellProps } from './components/CellProps';
import { MigrationTypeCell } from './components/MigrationTypeCell';
import { NamespaceCell } from './components/NamespaceCell';
import { PlanCell } from './components/PlanCell';
import { PlanStatusCell } from './components/PlanStatusCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';
import { VMsCell } from './components/VMsCell';
import { PlanData } from '../../utils/types/PlanData';
import { PlanTableResourceId } from './constants';

const PlanRow: React.FC<RowProps<PlanData>> = ({ resourceFields, resourceData }) => {
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
    <TableCell>{data?.plan?.spec?.description}</TableCell>
  ),
  [PlanTableResourceId.Actions]: ActionsCell,
};

interface RenderTdProps {
  resourceData: PlanData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

export default PlanRow;
