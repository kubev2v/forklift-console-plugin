import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';
import { groupVersionKindForObj } from 'src/utils/resources';

import { ResourceField, RowProps } from '@kubev2v/common';
import { Td } from '@patternfly/react-table';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import { withResourceLink } from './components/VmResourceLinkRenderer';
import { VMCellProps, VmData, VmFeaturesCell, VMNameCellRenderer } from './components';
import { getVmTemplate } from './utils';

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  name: withResourceLink({
    toName: ({ data }) => data.name,
    toGVK: ({ data }) =>
      (data.vm.providerType === 'openshift' && groupVersionKindForObj(data.vm.object)) || {
        version: '',
        kind: '',
      },
    Component: VMNameCellRenderer,
  }),
  possibly_remote_namespace: withResourceLink({
    toName: ({ data }) =>
      (data.vm.providerType === 'openshift' && data.vm.object?.metadata?.namespace) || '',
    toGVK: () => ({ kind: 'Namespace', version: 'v1', group: 'core' }),
    Component: ({ data }: VMCellProps) => (
      <TableCell>
        {(data.vm.providerType === 'openshift' && data.vm.object?.metadata?.namespace) || ''}
      </TableCell>
    ),
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
