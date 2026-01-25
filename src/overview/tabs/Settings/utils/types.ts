import type { V1beta1ForkliftController } from '@forklift-ui/types';

export enum SettingsFields {
  ControllerCPULimit = 'controller_container_limits_cpu',
  ControllerMemoryLimit = 'controller_container_limits_memory',
  ControllerTransferNetwork = 'controller_transfer_network',
  InventoryMemoryLimit = 'inventory_container_limits_memory',
  MaxVMInFlight = 'controller_max_vm_inflight',
  PrecopyInterval = 'controller_precopy_interval',
  SnapshotStatusCheckRate = 'controller_snapshot_status_check_rate_seconds',
}

export type ForkliftSettingsValues = {
  [SettingsFields.ControllerCPULimit]?: string;
  [SettingsFields.ControllerMemoryLimit]?: string;
  [SettingsFields.ControllerTransferNetwork]?: string;
  [SettingsFields.InventoryMemoryLimit]?: string;
  [SettingsFields.MaxVMInFlight]?: number;
  [SettingsFields.PrecopyInterval]?: number;
  [SettingsFields.SnapshotStatusCheckRate]?: number;
};

export type EnhancedForkliftController = V1beta1ForkliftController & {
  spec: {
    [SettingsFields.ControllerCPULimit]?: string;
    [SettingsFields.ControllerMemoryLimit]?: string;
    [SettingsFields.ControllerTransferNetwork]?: string;
    [SettingsFields.InventoryMemoryLimit]?: string;
    [SettingsFields.MaxVMInFlight]?: number;
    [SettingsFields.PrecopyInterval]?: number;
    [SettingsFields.SnapshotStatusCheckRate]?: number;
  } & Record<string, string | number>;
};

export type SettingsEditProps = {
  controller: V1beta1ForkliftController;
};
