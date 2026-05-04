import type { FC } from 'react';
import InspectionStatusLabel from 'src/components/InspectVirtualMachines/InspectionStatusLabel';

import type { ResourceField } from '@components/common/utils/types';
import VirtualMachineConcernsCell from '@components/Concerns/VirtualMachineConcernsCell';
import VirtualMachinePowerStateCell from '@components/PowerState/VirtualMachinePowerStateCell';
import { nameColumn } from '@components/VsphereFoldersTable/utils/constants';
import type { VmRow } from '@components/VsphereFoldersTable/utils/types';
import type { VSphereVM } from '@forklift-ui/types';
import { Td, TreeRowWrapper } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

type VmTreeRowProps = {
  columns: ResourceField[];
  conversions: V1beta1Conversion[];
  row: VmRow;
};

const VmCells: Record<string, FC<{ conversions: V1beta1Conversion[]; row: VmRow }>> = {
  concerns: ({ row }) => <VirtualMachineConcernsCell vmData={row.vmData} />,
  host: ({ row }) => <>{row.vmData.hostName ?? EMPTY_MSG}</>,
  inspectionStatus: ({ conversions, row }) => {
    const getStatus = useVmInspectionStatus(conversions);
    const status = getStatus(row.vmData.vm?.id ?? '');
    return <InspectionStatusLabel phase={status?.phase} timestamp={status?.lastRun} />;
  },
  path: ({ row }) => <>{(row.vmData.vm as VSphereVM).path ?? EMPTY_MSG}</>,
  power: ({ row }) => <VirtualMachinePowerStateCell vmData={row.vmData} />,
};

const VmTreeRow: FC<VmTreeRowProps> = ({ columns, conversions, row }) => {
  return (
    <TreeRowWrapper data-testid={row.key} key={row.key} row={{ props: row?.treeRow?.props }}>
      <Td treeRow={row.treeRow} dataLabel={nameColumn.label} data-testid={`${row.key}-name-cell`}>
        {row.vmData.name}
      </Td>
      {columns.map((col) => {
        if (!col.isVisible) return null;
        const Component = VmCells[col.resourceFieldId!];
        if (!Component) return null;
        return (
          <Td
            key={col.resourceFieldId}
            dataLabel={col.label ?? ''}
            data-testid={`${row.key}-${col.resourceFieldId}-cell`}
          >
            <Component row={row} conversions={conversions} />
          </Td>
        );
      })}
    </TreeRowWrapper>
  );
};

export default VmTreeRow;
