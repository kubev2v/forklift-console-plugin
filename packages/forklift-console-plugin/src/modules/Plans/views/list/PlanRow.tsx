import React from 'react';
import { ConsoleTimestamp } from 'src/components';
import { TableCell } from 'src/modules/Providers/utils';

import { getResourceFieldValue } from '@forklift/common/components/FilterGroup/matchers';
import { RowProps } from '@forklift/common/components/TableView/types';
import { ResourceField } from '@forklift/common/utils/types';
import { Td, Tr } from '@patternfly/react-table';

import { PlanData } from '../../utils';

import {
  ActionsCell,
  CellProps,
  NamespaceCell,
  PlanCell,
  PlanStatusCell,
  ProviderLinkCell,
  VMsCell,
} from './components';

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

const cellRenderers: Record<string, React.FC<CellProps>> = {
  ['name']: PlanCell,
  ['namespace']: NamespaceCell,
  ['migration-started']: (props: CellProps) => {
    const value = getResourceFieldValue(props.data, props.fieldId, props.fields);
    return <ConsoleTimestamp timestamp={value} />;
  },
  ['destination']: ProviderLinkCell,
  ['source']: ProviderLinkCell,
  ['phase']: PlanStatusCell,
  ['vms']: VMsCell,
  ['description']: ({ data }: CellProps) => <TableCell>{data?.obj?.spec?.description}</TableCell>,
  ['actions']: ActionsCell,
};

interface RenderTdProps {
  resourceData: PlanData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

export default PlanRow;
