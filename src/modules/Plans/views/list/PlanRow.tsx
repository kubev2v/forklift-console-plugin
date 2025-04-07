import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { ResourceField } from '@components/common/utils/types';
import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { Td, Tr } from '@patternfly/react-table';

import type { PlanData } from '../../utils/types/PlanData';

import { ActionsCell } from './components/ActionsCell';
import type { CellProps } from './components/CellProps';
import { MigrationTypeCell } from './components/MigrationTypeCell';
import { NamespaceCell } from './components/NamespaceCell';
import { PlanCell } from './components/PlanCell';
import { PlanStatusCell } from './components/PlanStatusCell';
import { ProviderLinkCell } from './components/ProviderLinkCell';
import { VMsCell } from './components/VMsCell';
import { PlanTableResourceId } from './constants';

const PlanRow: FC<RowProps<PlanData>> = ({ resourceData, resourceFields }) => {
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
    <TableCell>{data?.plan?.spec?.description}</TableCell>
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
