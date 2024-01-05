import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';
import { groupVersionKindForObj } from 'src/utils/resources';

import { ResourceField, RowProps } from '@kubev2v/common';
import { Td } from '@patternfly/react-table';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import { withResourceLink } from './components/VmResourceLinkRenderer';
import { VMCellProps, VmData, VmFeaturesCell } from './components';
import { getVmTemplate } from './utils';

const toNamespace = ({ data }: VMCellProps) =>
  (data.vm.providerType === 'openshift' && data.vm.object?.metadata?.namespace) || '';

const toGVK = ({ data }) =>
  (data.vm.providerType === 'openshift' && groupVersionKindForObj(data.vm.object)) || {
    version: '',
    kind: '',
  };

const cellRenderers: Record<string, React.FC<VMCellProps>> = {
  name: withResourceLink({
    toName: ({ data }) => data.name,
    toNamespace,
    toGVK,
  }),
  possibly_remote_namespace: withResourceLink({
    toName: toNamespace,
    toGVK: () => ({ kind: 'Namespace', version: 'v1', group: 'core' }),
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
