import { TableLinkCell } from 'src/modules/Providers/utils/components/TableCell/TableLinkCell';
import MigrationStatusLabel from 'src/plans/details/tabs/Details/components/MigrationsSection/components/MigrationStatusLabel';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { VirtualMachineModelGroupVersionKind } from '@utils/crds/common/models';

import DisksCounter from '../components/DisksCounter';
import DisksTransfer from '../components/DisksTransfer';

import {
  type MigrationStatusVirtualMachinePageData,
  MigrationStatusVirtualMachinesTableResourceId,
} from './types';
import { getVMDiskTransferPipeline, isVirtualMachineCreationCompleted } from './utils';

export const getMigrationStatusVirtualMachinesRowFields = (
  fieldsData: MigrationStatusVirtualMachinePageData,
) => {
  const { specVM, statusVM, targetNamespace } = fieldsData;
  const vmCreated = isVirtualMachineCreationCompleted(statusVM);
  const diskTransferPipeline = getVMDiskTransferPipeline(statusVM);

  return {
    [MigrationStatusVirtualMachinesTableResourceId.DiskCounter]: (
      <DisksCounter diskTransferPipeline={diskTransferPipeline} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.MigrationCompleted]: (
      <ConsoleTimestamp timestamp={statusVM?.completed ?? null} showGlobalIcon={false} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.MigrationStarted]: (
      <ConsoleTimestamp timestamp={statusVM?.started ?? null} showGlobalIcon={false} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.Name]: vmCreated ? (
      <TableLinkCell
        groupVersionKind={VirtualMachineModelGroupVersionKind}
        name={specVM?.name ?? statusVM?.name}
        namespace={targetNamespace}
      />
    ) : (
      <>{specVM?.name ?? statusVM?.name}</>
    ),
    [MigrationStatusVirtualMachinesTableResourceId.Status]: (
      <MigrationStatusLabel statusVM={statusVM} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.Transfer]: (
      <DisksTransfer diskTransferPipeline={diskTransferPipeline} />
    ),
  };
};
