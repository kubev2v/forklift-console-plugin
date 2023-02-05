import { IVMwareVM, IRHVVM } from '../types/vms.types';
import { MOCK_DISK_ATTACHMENTS } from 'legacy/src/queries/mocks/disks.mock';
import { MOCK_NICS } from 'legacy/src/queries/mocks/nicProfiles.mock';
export let MOCK_VMWARE_VMS: IVMwareVM[] = [];
export let MOCK_RHV_VMS: IRHVVM[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_VMWARE_VMS = [
    {
      id: 'vm-1630',
      powerState: 'poweredOn',
      revision: 1,
      name: 'fdupont-test-migration',
      selfLink: '/providers/vsphere/test/vms/vm-1630',
      networks: [{ kind: 'Network', id: '1' }],
      disks: [
        {
          datastore: { kind: 'Datastore', id: '1' },
        },
        {
          datastore: { kind: 'Datastore', id: '1' },
        },
      ],
      concerns: [
        {
          category: 'Warning',
          label: 'Shareable disk detected',
          assessment:
            'Shared disks are only supported by certain OpenShift Virtualization storage configurations. Ensure that the correct storage is selected for the disk.',
        },
        {
          category: 'Warning',
          label: 'VM running in HA-enabled cluster',
          assessment:
            'Host/Node HA is not currently supported by OpenShift Virtualization. The VM can be migrated but it will not have this feature in the target environment.',
        },
        {
          category: 'Information',
          label: 'VM running in a DRS-enabled cluster',
          assessment:
            'Distributed resource scheduling is not currently supported by OpenShift Virtualization. The VM can be migrated but it will not have this feature in the target environment.',
        },
        {
          category: 'Information',
          label: 'VM snapshot detected',
          assessment: 'Warm migration may not be possible for this VM',
        },
      ],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-2844',
      powerState: 'poweredOff',
      revision: 1,
      name: 'fdupont-test',
      selfLink: '/providers/vsphere/test/vms/vm-2844',
      networks: [{ kind: 'Network', id: '1' }],
      disks: [
        {
          datastore: { kind: 'Datastore', id: '2' },
        },
      ],
      concerns: [
        { category: 'Information', label: 'Example', assessment: 'You should know something' },
      ],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-1008',
      powerState: 'poweredOn',
      revision: 1,
      name: 'fdupont-test-migration-centos',
      selfLink: '/providers/vsphere/test/vms/vm-1008',
      networks: [
        { kind: 'Network', id: '1' },
        { kind: 'Network', id: '2' },
      ],
      disks: [
        {
          datastore: { kind: 'Datastore', id: '1' },
        },
      ],
      concerns: [
        { category: 'Critical', label: 'Example', assessment: 'Something is really bad' },
        {
          category: 'Warning',
          label: 'Changed Block Tracking (CBT) not enabled',
          assessment:
            'Changed Block Tracking (CBT) has not been enabled on this VM. This feature is a prerequisite for VM warm migration.',
        },
      ],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-2685',
      powerState: 'poweredOn',
      revision: 2,
      name: 'pemcg-discovery01',
      selfLink: '/providers/vsphere/test/vms/vm-2685',
      networks: [{ kind: 'Network', id: '1' }],
      disks: [
        {
          datastore: { kind: 'Datastore', id: '2' },
        },
      ],
      concerns: [{ category: 'Warning', label: 'Example', assessment: 'Something is wrong' }],
      revisionValidated: 1,
      isTemplate: false,
    },
    {
      id: 'vm-431',
      powerState: 'poweredOff',
      revision: 1,
      name: 'pemcg-iscsi-target',
      selfLink: '/providers/vsphere/test/vms/vm-431',
      networks: [
        { kind: 'Network', id: '1' },
        { kind: 'Network', id: 'network-33' },
      ],
      disks: [
        {
          datastore: { kind: 'Datastore', id: '3' },
        },
        {
          datastore: { kind: 'Datastore', id: '3' },
        },
      ],
      concerns: [],
      revisionValidated: 1,
      isTemplate: false,
    },
  ];

  MOCK_VMWARE_VMS.push({
    ...MOCK_VMWARE_VMS[0],
    id: 'vm-template-test',
    name: 'vm-template-test',
    selfLink: '/providers/vsphere/test/vms/vm-template-test',
    isTemplate: true,
  });

  MOCK_RHV_VMS = [
    {
      id: '3dcaf3ec-6b51-4ca0-8345-6d61841731d7',
      status: 'up',
      revision: 1,
      name: 'fdupont-cfme-5.11.9.0-1',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/3dcaf3ec-6b51-4ca0-8345-6d61841731d7',
      revisionValidated: 0,
      nics: [MOCK_NICS[0]], // network 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[0], MOCK_DISK_ATTACHMENTS[0]], // storageDomain 1
      concerns: [],
    },
    {
      id: '2a66a719-440c-4544-9da0-692d14338b12',
      status: 'up',
      revision: 1,
      name: 'fdupont-dev-rhel8',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/2a66a719-440c-4544-9da0-692d14338b12',
      revisionValidated: 0,
      nics: [MOCK_NICS[1]], // network 2
      diskAttachments: [MOCK_DISK_ATTACHMENTS[0]], // storageDomain 1
      concerns: [],
    },
    {
      id: '64333a40-ffbb-4c28-add7-5560bdf082fb',
      status: 'up',
      revision: 1,
      name: 'fdupont-manageiq-dev',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/64333a40-ffbb-4c28-add7-5560bdf082fb',
      revisionValidated: 0,
      nics: [MOCK_NICS[0]], // network 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
    {
      id: '6f9de857-ef39-43b7-8853-af982286dc59',
      status: 'down',
      revision: 1,
      name: 'jenkins-me.v2v.bos.redhat.com',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/6f9de857-ef39-43b7-8853-af982286dc59',
      revisionValidated: 0,
      nics: [MOCK_NICS[2]], // network 3
      diskAttachments: [
        MOCK_DISK_ATTACHMENTS[0],
        MOCK_DISK_ATTACHMENTS[1],
        MOCK_DISK_ATTACHMENTS[0],
      ], // storageDomain 1 & 2
      concerns: [],
    },
    {
      id: 'bea5f184-972e-44e2-811a-2357829ab590',
      status: 'up',
      revision: 1,
      name: 'demo-cfme-5.11.7.3-1',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/bea5f184-972e-44e2-811a-2357829ab590',
      revisionValidated: 0,
      nics: [MOCK_NICS[0]], // network 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1], MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
    {
      id: 'b3eb91d4-2c42-4dc6-98fb-fee94f1df30d',
      status: 'up',
      revision: 1,
      name: 'dhcp.v2v.bos.redhat.com',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/b3eb91d4-2c42-4dc6-98fb-fee94f1df30d',
      revisionValidated: 0,
      nics: [MOCK_NICS[0]], // network 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[2]], // storageDomain 3
      concerns: [],
    },
    {
      id: 'be55c259-2415-448d-841e-f4b9d743242e',
      status: 'up',
      revision: 1,
      name: 'HostedEngine',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/be55c259-2415-448d-841e-f4b9d743242e',
      revisionValidated: 0,
      nics: [MOCK_NICS[1], MOCK_NICS[3]], // networks 2 & 4
      diskAttachments: [MOCK_DISK_ATTACHMENTS[3]], // storageDomain 4
      concerns: [],
    },
    {
      id: '54426696-297d-4ae4-a2a3-c7bc43ee5ccf',
      status: 'up',
      revision: 1,
      name: 'ipam.v2v.bos.redhat.com',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/54426696-297d-4ae4-a2a3-c7bc43ee5ccf',
      revisionValidated: 0,
      nics: [MOCK_NICS[2]], // network 3
      diskAttachments: [MOCK_DISK_ATTACHMENTS[2]], // storageDomain 3
      concerns: [],
    },
    {
      id: '84d2359c-45d3-401f-a942-81020d6a58bd',
      status: 'up',
      revision: 1,
      name: 'jlabocki-master-1',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/84d2359c-45d3-401f-a942-81020d6a58bd',
      revisionValidated: 0,
      nics: [MOCK_NICS[2]], // network 3
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
    {
      id: '25284d90-3684-4643-8f60-c72cc8ccfbff',
      status: 'up',
      revision: 1,
      name: 'jlabocki-master-3',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/25284d90-3684-4643-8f60-c72cc8ccfbff',
      revisionValidated: 0,
      nics: [MOCK_NICS[2]], // network 3
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
    {
      id: 'aa6eca14-b91d-447f-8050-4a7127d33244',
      status: 'up',
      revision: 1,
      name: 'jlabocki-swarm-2',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/aa6eca14-b91d-447f-8050-4a7127d33244',
      revisionValidated: 0,
      nics: [MOCK_NICS[0]], // network 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
    {
      id: 'cdb41d1c-481a-4d24-a239-fe77813608cd',
      status: 'down',
      revision: 1,
      name: 'jlabocki-worker-1',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/cdb41d1c-481a-4d24-a239-fe77813608cd',
      revisionValidated: 0,
      nics: [MOCK_NICS[2]], // network 3
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
    {
      id: 'fe91d819-94e4-4e77-8d8d-399484601937',
      status: 'down',
      revision: 1,
      name: 'bthurber-kvm0.v2v.bos.redhat.com',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/fe91d819-94e4-4e77-8d8d-399484601937',
      revisionValidated: 0,
      nics: [MOCK_NICS[3], MOCK_NICS[0]], // networks 4 & 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[4], MOCK_DISK_ATTACHMENTS[4]], // storageDomain 5
      concerns: [],
    },
    {
      id: '18d82ffd-8c1a-407a-a2c4-119b6d81375a',
      status: 'down',
      revision: 1,
      name: 'jlabocki-centos',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/18d82ffd-8c1a-407a-a2c4-119b6d81375a',
      revisionValidated: 0,
      nics: [MOCK_NICS[0]], // network 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[2]], // storageDomain 3
      concerns: [],
    },
    {
      id: 'f9ee4c85-e880-48eb-86d4-639bf2956049',
      status: 'down',
      revision: 1,
      name: 'jlabocki-master-2',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/f9ee4c85-e880-48eb-86d4-639bf2956049',
      revisionValidated: 0,
      nics: [MOCK_NICS[2]], // network 3
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
    {
      id: '35c259ac-603a-458e-81f6-8d9ed3a8e1ee',
      status: 'up',
      revision: 1,
      name: 'jlabocki-swarm-1',
      selfLink:
        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/35c259ac-603a-458e-81f6-8d9ed3a8e1ee',
      revisionValidated: 0,
      nics: [MOCK_NICS[0]], // network 1
      diskAttachments: [MOCK_DISK_ATTACHMENTS[1]], // storageDomain 2
      concerns: [],
    },
  ];
}
