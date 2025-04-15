import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

import { PowerStateCellRenderer } from './components/PowerStateCellRenderer';
import type { VMCellProps, VmData } from './components/VMCellProps';
import { VmFeaturesCell } from './components/VmFeaturesCell';
import { withResourceLink } from './components/VmResourceLinkRenderer';
import { getVmTemplate } from './utils/helpers/vmProps';

const toNamespace = ({ data }: VMCellProps) =>
  (data.vm.providerType === 'openshift' && data.vm.object?.metadata?.namespace) || '';

const cellRenderers: Record<string, FC<VMCellProps>> = {
  features: VmFeaturesCell,
  name: withResourceLink({
    toGVK: () => ({ group: 'kubevirt.io', kind: 'VirtualMachine', version: 'v1' }),
    toName: ({ data }) => data.name,
    toNamespace,
  }),
  possiblyRemoteNamespace: withResourceLink({
    toGVK: () => ({ group: '', kind: 'Namespace', version: 'v1' }),
    toName: toNamespace,
    toNamespace: () => '',
  }),
  status: PowerStateCellRenderer,
  template: ({ data }) => <TableCell>{getVmTemplate(data?.vm)}</TableCell>,
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

type RenderTdProps = {
  resourceData: VmData;
  resourceFieldId: string;
  resourceFields: ResourceField[];
};

export const OpenShiftVirtualMachinesCells: FC<RowProps<VmData>> = ({
  resourceData,
  resourceFields,
}) => {
  return (
    <>
      {resourceFields?.map(({ resourceFieldId }) =>
        renderTd({ resourceData, resourceFieldId, resourceFields }),
      )}
    </>
  );
};
