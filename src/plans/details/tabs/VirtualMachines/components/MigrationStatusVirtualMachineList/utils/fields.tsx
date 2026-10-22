import type { ReactNode } from 'react';
import { TableLinkCell } from 'src/components/TableCell/TableLinkCell';
import MigrationStatusLabel from 'src/plans/details/tabs/Details/components/MigrationsSection/components/MigrationStatusLabel';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { VirtualMachineModelGroupVersionKind } from '@utils/crds/common/models';
import { isEmpty } from '@utils/helpers';

import DisksCounter from '../components/DisksCounter';
import DisksTransfer from '../components/DisksTransfer';
import { VMCutoverCellRenderer } from '../components/VMCutoverCellRenderer';
import VMCutoverActions from '../components/VMMigrationActions';

import {
  type MigrationStatusVirtualMachinePageData,
  MigrationStatusVirtualMachinesTableResourceId,
} from './types';
import {
  getVMDiskTransferPipeline,
  isVirtualMachineCreationCompleted,
  isVmInPostMigrationSetup,
} from './utils';

export const getMigrationStatusVirtualMachinesRowFields = (
  fieldsData: MigrationStatusVirtualMachinePageData,
): Record<MigrationStatusVirtualMachinesTableResourceId, ReactNode> => {
  const { activeMigration, migration, specVM, statusVM, targetNamespace, vmId, vmName } =
    fieldsData;
  const vmCreated = isVirtualMachineCreationCompleted(statusVM);
  const diskTransferPipeline = getVMDiskTransferPipeline(statusVM);
  return {
    [MigrationStatusVirtualMachinesTableResourceId.Actions]:
      activeMigration && !isEmpty(activeMigration) && statusVM ? (
        <VMCutoverActions
          migration={activeMigration}
          statusVM={statusVM}
          vmId={vmId}
          vmName={vmName}
        />
      ) : null,
    [MigrationStatusVirtualMachinesTableResourceId.Cutover]:
      migration && !isEmpty(migration) ? (
        <VMCutoverCellRenderer migration={migration} vmId={vmId} />
      ) : null,
    [MigrationStatusVirtualMachinesTableResourceId.DiskCounter]: (
      <DisksCounter diskTransferPipeline={diskTransferPipeline} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.MigrationCompleted]: (
      <ConsoleTimestamp showGlobalIcon={false} timestamp={statusVM?.completed ?? null} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.MigrationStarted]: (
      <ConsoleTimestamp showGlobalIcon={false} timestamp={statusVM?.started ?? null} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.Name]:
      vmCreated && !isVmInPostMigrationSetup(statusVM) ? (
        <TableLinkCell
          groupVersionKind={VirtualMachineModelGroupVersionKind}
          name={statusVM?.newName ?? statusVM?.name ?? specVM?.name}
          namespace={targetNamespace}
        />
      ) : (
        <>{statusVM?.newName ?? statusVM?.name ?? specVM?.name}</>
      ),
    [MigrationStatusVirtualMachinesTableResourceId.Status]: (
      <MigrationStatusLabel statusVM={statusVM} />
    ),
    [MigrationStatusVirtualMachinesTableResourceId.Transfer]: (
      <DisksTransfer diskTransferPipeline={diskTransferPipeline} />
    ),
  };
};
