import React from 'react';
import { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import { VMCellProps, VmData } from './components/VMCellProps';
import { VmFeaturesCell } from './components/VmFeaturesCell';
import { withResourceLink } from './components/VmResourceLinkRenderer';
import { getVmTemplate } from './utils/helpers/vmProps';

const toNamespace = ({ data }: VMCellProps) =>
  (data.vm.providerType === 'openshift' && data.vm.object?.metadata?.namespace) || '';

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  name: withResourceLink({
    toName: ({ data }) => data.name,
    toNamespace,
    toGVK: () => ({ kind: 'VirtualMachine', version: 'v1', group: 'kubevirt.io' }),
  }),
  possibly_remote_namespace: withResourceLink({
    toName: toNamespace,
    toGVK: () => ({ kind: 'Namespace', version: 'v1', group: '' }),
    toNamespace: () => '',
  }),
  status: PowerStateCellRenderer,
  template: ({ data }) => <TableCell>{getVmTemplate(data?.vm)}</TableCell>,
  features: VmFeaturesCell,
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

interface RenderTdProps {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
}

export const OpenShiftVirtualMachinesCells: React.FC<RowProps<VmData>> = ({
  resourceFields,
  resourceData,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </>
  );
};
