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
import type { VmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';
import { useVmInspectionStatus } from '@utils/hooks/useVmInspectionStatus';

type VmTreeRowProps = {
  columns: ResourceField[];
  conversions: V1beta1Conversion[];
  row: VmRow;
};

type CellProps = { inspectionStatus: VmInspectionStatus | undefined; row: VmRow };

const VmCells: Record<string, FC<CellProps>> = {
  concerns: ({ row }) => <VirtualMachineConcernsCell vmData={row.vmData} />,
  host: ({ row }) => <>{row.vmData.hostName ?? EMPTY_MSG}</>,
  inspectionStatus: ({ inspectionStatus }) => (
    <InspectionStatusLabel phase={inspectionStatus?.phase} timestamp={inspectionStatus?.lastRun} />
  ),
  path: ({ row }) => <>{(row.vmData.vm as VSphereVM).path ?? EMPTY_MSG}</>,
  power: ({ row }) => <VirtualMachinePowerStateCell vmData={row.vmData} />,
};

const VmTreeRow: FC<VmTreeRowProps> = ({ columns, conversions, row }) => {
  const getInspectionStatus = useVmInspectionStatus(conversions);
  const inspectionStatus = getInspectionStatus(row.vmData.vm?.id ?? '');

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
            <Component row={row} inspectionStatus={inspectionStatus} />
          </Td>
        );
      })}
    </TreeRowWrapper>
  );
};

export default VmTreeRow;
