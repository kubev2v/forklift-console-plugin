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
    template: V1VirtualMachineInstanceTemplateSpec;

    // dataVolumeTemplates is a list of dataVolumes that the VirtualMachineInstance template can reference.
    // DataVolumes in this list are dynamically created for the VirtualMachine and are tied to the VirtualMachine's life-cycle.
    // DataVolumeTemplates []DataVolumeTemplateSpec `json:"dataVolumeTemplates,omitempty"`
    dataVolumeTemplates: {
      apiVersion: 'cdi.kubevirt.io/v1beta1';
      kind: 'DataVolume';
      metadata: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
      spec: {
        pvc?: {
          accessModes: string[];
          resources: {
            requests: {
              storage: string;
            };
          };
        };
        source?: {
          pvc: {
            name: string;
            namespace: string;
          };
        };
        sourceRef?: {
          kind: string;
          name: string;
          namespace: string;
        };
        storage?: {
          resources: {
            requests: {
              storage: string;
            };
          };
        };
      };
    }[];
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
    conditions?: {
      lastProbeTime: string;
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type: string;
    }[];

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
    volumeSnapshotStatuses?: {
      enabled: boolean;
      name: string;
      reason?: string;
    }[];
  };
}

export type VirtualMachinePrintableStatus =
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

export interface V1VirtualMachineInstanceTemplateSpec {
  // ObjectMeta metav1.ObjectMeta `json:"metadata,omitempty"`
  metadata: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  // VirtualMachineInstance Spec contains the VirtualMachineInstance specification.
  // Spec VirtualMachineInstanceSpec `json:"spec,omitempty" valid:"required"`
  spec: V1VirtualMachineInstanceSpec;
}

interface V1VirtualMachineInstanceSpec {
  // If specified, indicates the pod's priority.
  // If not specified, the pod priority will be default or zero if there is no
  // default.
  // +optional
  // PriorityClassName string `json:"priorityClassName,omitempty"`

  // Specification of the desired behavior of the VirtualMachineInstance on the host.
  // Domain DomainSpec `json:"domain"`
  domain: V1DomainSpec;

  // NodeSelector is a selector which must be true for the vmi to fit on a node.
  // Selector which must match a node's labels for the vmi to be scheduled on that node.
  // More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/
  // +optional
  // NodeSelector map[string]string `json:"nodeSelector,omitempty"`

  // If affinity is specifies, obey all the affinity rules
  // Affinity *k8sv1.Affinity `json:"affinity,omitempty"`

  // If specified, the VMI will be dispatched by specified scheduler.
  // If not specified, the VMI will be dispatched by default scheduler.
  // +optional
  // SchedulerName string `json:"schedulerName,omitempty"`

  // If toleration is specified, obey all the toleration rules.
  // Tolerations []k8sv1.Toleration `json:"tolerations,omitempty"`

  // EvictionStrategy can be set to "LiveMigrate" if the VirtualMachineInstance should be
  // migrated instead of shut-off in case of a node drain.
  //
  // +optional
  // EvictionStrategy *EvictionStrategy `json:"evictionStrategy,omitempty"`
  evictionStrategy?: string;

  // StartStrategy can be set to "Paused" if Virtual Machine should be started in paused state.
  //
  // +optional
  // StartStrategy *StartStrategy `json:"startStrategy,omitempty"`

  // Grace period observed after signalling a VirtualMachineInstance to stop after which the VirtualMachineInstance is force terminated.
  //TerminationGracePeriodSeconds *int64 `json:"terminationGracePeriodSeconds,omitempty"`
  terminationGracePeriodSeconds?: number;

  // List of volumes that can be mounted by disks belonging to the vmi.
  // Volumes []Volume `json:"volumes,omitempty"`
  volumes: {
    // Volume represents a named volume in a vmi.

    // Volume's name.
    // Must be a DNS_LABEL and unique within the vmi.
    // More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
    //	Name string `json:"name"`
    name: string;
    // VolumeSource represents the location and type of the mounted volume.
    // Defaults to Disk, if no type is specified.
    // VolumeSource `json:",inline"`
    cloudInitNoCloud?: {
      userData: string;
    };

    // DataVolume represents the dynamic creation a PVC for this volume as well as
    // the process of populating that PVC with a disk image.
    // +optional
    // DataVolume *DataVolumeSource `json:"dataVolume,omitempty"`
    dataVolume?: {
      // Name represents the name of the DataVolume in the same namespace
      // Name string `json:"name"`
      name: string;
    };
  }[];

  // Periodic probe of VirtualMachineInstance liveness.
  // VirtualmachineInstances will be stopped if the probe fails.
  // Cannot be updated.
  // More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes
  // +optional
  // LivenessProbe *Probe `json:"livenessProbe,omitempty"`

  // Periodic probe of VirtualMachineInstance service readiness.
  // VirtualmachineInstances will be removed from service endpoints if the probe fails.
  // Cannot be updated.
  // More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes
  // +optional
  // ReadinessProbe *Probe `json:"readinessProbe,omitempty"`

  // Specifies the hostname of the vmi
  // If not specified, the hostname will be set to the name of the vmi, if dhcp or cloud-init is configured properly.
  // +optional
  // Hostname string `json:"hostname,omitempty"`

  // If specified, the fully qualified vmi hostname will be "<hostname>.<subdomain>.<pod namespace>.svc.<cluster domain>".
  // If not specified, the vmi will not have a domainname at all. The DNS entry will resolve to the vmi,
  // no matter if the vmi itself can pick up a hostname.
  // +optional
  // Subdomain string `json:"subdomain,omitempty"`

  // List of networks that can be attached to a vm's virtual interface.
  // Networks []Network `json:"networks,omitempty"`
  networks: {
    // Network represents a network type and a resource that should be connected to the vm.
    // Network name.
    // Must be a DNS_LABEL and unique within the vm.
    // More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
    //	Name string `json:"name"`
    name: string;
    // NetworkSource represents the network type and the source interface that should be connected to the virtual machine.
    // Defaults to Pod, if no type is specified.
    // NetworkSource `json:",inline"`
    pod?: object;
    multus?: object;
  }[];

  // Set DNS policy for the pod.
  // Defaults to "ClusterFirst".
  // Valid values are 'ClusterFirstWithHostNet', 'ClusterFirst', 'Default' or 'None'.
  // DNS parameters given in DNSConfig will be merged with the policy selected with DNSPolicy.
  // To have DNS options set along with hostNetwork, you have to specify DNS policy
  // explicitly to 'ClusterFirstWithHostNet'.
  // +optional
  // DNSPolicy k8sv1.DNSPolicy `json:"dnsPolicy,omitempty" protobuf:"bytes,6,opt,name=dnsPolicy,casttype=DNSPolicy"`

  // Specifies the DNS parameters of a pod.
  // Parameters specified here will be merged to the generated DNS
  // configuration based on DNSPolicy.
  // +optional
  // DNSConfig *k8sv1.PodDNSConfig `json:"dnsConfig,omitempty" protobuf:"bytes,26,opt,name=dnsConfig"`

  // Specifies a set of public keys to inject into the vm guest
  // +listType=atomic
  // +optional
  //AccessCredentials []AccessCredential `json:"accessCredentials,omitempty"`
}

export interface V1DomainSpec {
  // Resources describes the Compute Resources required by this vmi.
  // Resources ResourceRequirements `json:"resources,omitempty"`
  resources?: {
    requests?: {
      memory: string;
    };
  };

  // CPU allow specified the detailed CPU topology inside the vmi.
  // +optional
  // CPU *CPU `json:"cpu,omitempty"`
  cpu?: {
    cores: number;
    sockets: number;
    threads: number;
    dedicatedCpuPlacement?: boolean;
    numa?: unknown;
  };

  // Memory allow specifying the VMI memory features.
  // +optional
  // Memory *Memory `json:"memory,omitempty"`

  // Machine type.
  // +optional
  // Machine *Machine `json:"machine,omitempty"`
  machine?: {
    type: string;
  };

  // Firmware.
  // +optional
  // Firmware *Firmware `json:"firmware,omitempty"`
  firmware?: {
    bootloader?: {
      efi?: {
        persistent?: boolean;
      };
    };
  };

  // Clock sets the clock and timers of the vmi.
  // +optional
  // Clock *Clock `json:"clock,omitempty"`

  // Features like acpi, apic, hyperv, smm.
  // +optional
  // Features *Features `json:"features,omitempty"`
  features?: {
    acpi?: unknown;
    smm?: unknown;
  };

  // Devices allows adding disks, network interfaces, and others
  // Devices Devices `json:"devices"`
  devices: Devices;

  // Controls whether or not disks will share IOThreads.
  // Omitting IOThreadsPolicy disables use of IOThreads.
  // One of: shared, auto
  // +optional
  // IOThreadsPolicy *IOThreadsPolicy `json:"ioThreadsPolicy,omitempty"`

  // Chassis specifies the chassis info passed to the domain.
  // +optional
  // Chassis *Chassis `json:"chassis,omitempty"`
}

interface Devices {
  // Fall back to legacy virtio 0.9 support if virtio bus is selected on devices.
  // This is helpful for old machines like CentOS6 or RHEL6 which
  // do not understand virtio_non_transitional (virtio 1.0).
  // UseVirtioTransitional *bool `json:"useVirtioTransitional,omitempty"`

  // DisableHotplug disabled the ability to hotplug disks.
  // DisableHotplug bool `json:"disableHotplug,omitempty"`

  // Disks describes disks, cdroms, floppy and luns which are connected to the vmi.
  // Disks []Disk `json:"disks,omitempty"`
  disks: {
    disk?: {
      bus?: string;
    };
    name: string;
  }[];

  // Watchdog describes a watchdog device which can be added to the vmi.
  // Watchdog *Watchdog `json:"watchdog,omitempty"`

  // Interfaces describe network interfaces which are added to the vmi.
  // Interfaces []Interface `json:"interfaces,omitempty"`
  interfaces: {
    name: string;
    masquerade?: object;
    macAddress?: string;
    model?: string;
  }[];

  // Inputs describe input devices
  // Inputs []Input `json:"inputs,omitempty"`

  // Whether to attach a pod network interface. Defaults to true.
  // AutoattachPodInterface *bool `json:"autoattachPodInterface,omitempty"`

  // Whether to attach the default graphics device or not.
  // VNC will not be available if set to false. Defaults to true.
  // AutoattachGraphicsDevice *bool `json:"autoattachGraphicsDevice,omitempty"`

  // Whether to attach the default serial console or not.
  // Serial console access will not be available if set to false. Defaults to true.
  // AutoattachSerialConsole *bool `json:"autoattachSerialConsole,omitempty"`

  // Whether to attach the Memory balloon device with default period.
  // Period can be adjusted in virt-config.
  // Defaults to true.
  // +optional
  // AutoattachMemBalloon *bool `json:"autoattachMemBalloon,omitempty"`

  // Whether to have random number generator from host
  // +optional
  // Rng *Rng `json:"rng,omitempty"`
  rng?: object;

  // Whether or not to enable virtio multi-queue for block devices.
  // Defaults to false.
  // +optional
  // BlockMultiQueue *bool `json:"blockMultiQueue,omitempty"`

  // If specified, virtual network interfaces configured with a virtio bus will also enable the vhost multiqueue feature for network devices. The number of queues created depends on additional factors of the VirtualMachineInstance, like the number of guest CPUs.
  // +optional
  // NetworkInterfaceMultiQueue *bool `json:"networkInterfaceMultiqueue,omitempty"`
  networkInterfaceMultiqueue?: boolean;

  //Whether to attach a GPU device to the vmi.
  // +optional
  // +listType=atomic
  // GPUs []GPU `json:"gpus,omitempty"`
  gpus?: unknown[];

  // Filesystems describes filesystem which is connected to the vmi.
  // +optional
  // +listType=atomic
  // Filesystems []Filesystem `json:"filesystems,omitempty"`

  //Whether to attach a host device to the vmi.
  // +optional
  // +listType=atomic
  // HostDevices []HostDevice `json:"hostDevices,omitempty"`
  hostDevices?: unknown[];

  tpm?: {
    persistent?: boolean;
  };
}
