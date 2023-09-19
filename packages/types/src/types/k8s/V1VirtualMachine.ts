// https://github.com/kubev2v/forklift/blob/main/vendor/kubevirt.io/api/export/v1alpha1/types.go

import { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '../../models';

// https://kubevirt.io/api-reference/master/definitions.html#_v1_virtualmachine
export interface V1VirtualMachine {
  kind: 'VirtualMachine';
  apiVersion: 'kubevirt.io/v1';
  metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  spec?: {
    // Mutually exclusive with RunStrategy
    // Running *bool `json:"running,omitempty" optional:"true"`
    running?: boolean;

    // Running state indicates the requested running state of the VirtualMachineInstance
    // mutually exclusive with Running
    // RunStrategy *VirtualMachineRunStrategy `json:"runStrategy,omitempty" optional:"true"`

    // Template is the direct specification of VirtualMachineInstance
    // Template *VirtualMachineInstanceTemplateSpec `json:"template"`

    // dataVolumeTemplates is a list of dataVolumes that the VirtualMachineInstance template can reference.
    // DataVolumes in this list are dynamically created for the VirtualMachine and are tied to the VirtualMachine's life-cycle.
    // DataVolumeTemplates []DataVolumeTemplateSpec `json:"dataVolumeTemplates,omitempty"`
  };
  status?: {
    // SnapshotInProgress is the name of the VirtualMachineSnapshot currently executing
    // SnapshotInProgress *string `json:"snapshotInProgress,omitempty"`
    // Created indicates if the virtual machine is created in the cluster
    // Created bool `json:"created,omitempty"`
    created?: boolean;
    // Ready indicates if the virtual machine is running and ready
    // Ready bool `json:"ready,omitempty"`
    ready?: boolean;
    // PrintableStatus is a human readable, high-level representation of the status of the virtual machine
    // PrintableStatus VirtualMachinePrintableStatus `json:"printableStatus,omitempty"`
    printableStatus: VirtualMachinePrintableStatus;
    // Hold the state information of the VirtualMachine and its VirtualMachineInstance
    // Conditions []VirtualMachineCondition `json:"conditions,omitempty" optional:"true"`
    // StateChangeRequests indicates a list of actions that should be taken on a VMI
    // e.g. stop a specific VMI then start a new one.
    // StateChangeRequests []VirtualMachineStateChangeRequest `json:"stateChangeRequests,omitempty" optional:"true"`
    // VolumeRequests indicates a list of volumes add or remove from the VMI template and
    // hotplug on an active running VMI.
    // +listType=atomic
    // VolumeRequests []VirtualMachineVolumeRequest `json:"volumeRequests,omitempty" optional:"true"`

    // VolumeSnapshotStatuses indicates a list of statuses whether snapshotting is
    // supported by each volume.
    // VolumeSnapshotStatuses []VolumeSnapshotStatus `json:"volumeSnapshotStatuses,omitempty" optional:"true"`
  };
}

type VirtualMachinePrintableStatus =
  // VirtualMachineStatusStopped indicates that the virtual machine is currently stopped and isn't expected to start.
  | 'Stopped'
  // VirtualMachineStatusProvisioning indicates that cluster resources associated with the virtual machine
  // (e.g., DataVolumes) are being provisioned and prepared.
  | 'Provisioning'
  // VirtualMachineStatusStarting indicates that the virtual machine is being prepared for running.
  | 'Starting'
  // VirtualMachineStatusRunning indicates that the virtual machine is running.
  | 'Running'
  // VirtualMachineStatusPaused indicates that the virtual machine is paused.
  | 'Paused'
  // VirtualMachineStatusStopping indicates that the virtual machine is in the process of being stopped.
  | 'Stopping'
  // VirtualMachineStatusTerminating indicates that the virtual machine is in the process of deletion,
  // as well as its associated resources (VirtualMachineInstance, DataVolumes, …).
  | 'Terminating'
  // VirtualMachineStatusMigrating indicates that the virtual machine is in the process of being migrated
  // to another host.
  | 'Migrating'
  // VirtualMachineStatusUnknown indicates that the state of the virtual machine could not be obtained,
  // typically due to an error in communicating with the host on which it's running.
  | 'Unknown';
