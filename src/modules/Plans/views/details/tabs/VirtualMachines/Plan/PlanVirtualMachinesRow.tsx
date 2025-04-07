import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

import { ConditionsCellRenderer } from '../components/ConditionsCellRenderer';
import { NameCellRenderer } from '../components/NameCellRenderer';
import type { PlanVMsCellProps } from '../components/PlanVMsCellProps';
import type { VMData } from '../types/VMData';

import ActionsCell from './ActionsCell';

export const PlanVirtualMachinesRow: FC<RowProps<VMData>> = ({ resourceData, resourceFields }) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </>
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

const cellRenderers: Record<string, FC<PlanVMsCellProps>> = {
  actions: ActionsCell,
  conditions: ConditionsCellRenderer,
  name: NameCellRenderer,
};

type RenderTdProps = {
  resourceData: VMData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};
